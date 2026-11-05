# OrbitForge AWS CLI deploy (no CDK)
# Usage: pwsh -File infrastructure/cli/deploy.ps1

param(
  [switch]$SkipFrontendBuild,
  [switch]$SkipSmoke
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "config.ps1")

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$frontendDir = Join-Path $repoRoot "frontend"
$backendDir = Join-Path $repoRoot "backend"
$workDir = Join-Path $PSScriptRoot ".work"
New-Item -ItemType Directory -Force -Path $workDir | Out-Null

$env:AWS_PROFILE = $OrbitForgeConfig.Profile
$env:AWS_DEFAULT_REGION = $OrbitForgeConfig.Region

Write-Host "Using profile=$($OrbitForgeConfig.Profile) region=$($OrbitForgeConfig.Region)"
$accountId = Get-AwsAccountId
$siteBucket = "$($OrbitForgeConfig.SiteBucketPrefix)-$accountId-$($OrbitForgeConfig.Region)"
$contentBucket = "$($OrbitForgeConfig.ContentBucketPrefix)-$accountId-$($OrbitForgeConfig.Region)"
$state = Read-DeployState
$state.AccountId = $accountId
$state.Region = $OrbitForgeConfig.Region
$state.SiteBucket = $siteBucket

function Ensure-DynamoTable {
  param([string]$TableName, [string]$HashKey)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  aws dynamodb describe-table --table-name $TableName --profile $OrbitForgeConfig.Profile --region $OrbitForgeConfig.Region 1>$null 2>$null
  $ok = ($LASTEXITCODE -eq 0)
  $ErrorActionPreference = $prev
  if ($ok) {
    Write-Host "DynamoDB table exists: $TableName"
    return
  }
  Write-Host "Creating DynamoDB table: $TableName"
  Invoke-Aws dynamodb create-table `
    --table-name $TableName `
    --attribute-definitions "AttributeName=$HashKey,AttributeType=S" `
    --key-schema "AttributeName=$HashKey,KeyType=HASH" `
    --billing-mode PAY_PER_REQUEST | Out-Null
  Invoke-Aws dynamodb wait table-exists --table-name $TableName
}

function Ensure-LambdaRole {
  $roleName = $OrbitForgeConfig.LambdaRoleName
  $roleArn = "arn:aws:iam::${accountId}:role/$roleName"
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  aws iam get-role --role-name $roleName --profile $OrbitForgeConfig.Profile 1>$null 2>$null
  $roleMissing = ($LASTEXITCODE -ne 0)
  $ErrorActionPreference = $prev
  if ($roleMissing) {
    Write-Host "Creating IAM role $roleName"
    $trust = @'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
'@
    $trustPath = Join-Path $workDir "lambda-trust.json"
    [System.IO.File]::WriteAllText($trustPath, $trust, (New-Object System.Text.UTF8Encoding $false))
    Invoke-Aws iam create-role --role-name $roleName --assume-role-policy-document "file://$trustPath" | Out-Null
    Start-Sleep -Seconds 8
  }

  $policy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:$($OrbitForgeConfig.Region):${accountId}:*"
    },
    {
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem"],
      "Resource": [
        "arn:aws:dynamodb:$($OrbitForgeConfig.Region):${accountId}:table/$($OrbitForgeConfig.FeedbackTable)",
        "arn:aws:dynamodb:$($OrbitForgeConfig.Region):${accountId}:table/$($OrbitForgeConfig.ReactionsTable)"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::$contentBucket",
        "arn:aws:s3:::$contentBucket/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["codebuild:StartBuild", "codebuild:BatchGetBuilds"],
      "Resource": "arn:aws:codebuild:$($OrbitForgeConfig.Region):${accountId}:project/$($OrbitForgeConfig.CodeBuildProject)"
    }
  ]
}
"@
  $policyPath = Join-Path $workDir "lambda-policy.json"
  [System.IO.File]::WriteAllText($policyPath, $policy, (New-Object System.Text.UTF8Encoding $false))
  Invoke-Aws iam put-role-policy --role-name $roleName --policy-name orbitforge-api-inline --policy-document "file://$policyPath" | Out-Null
  return $roleArn
}

function Build-LambdaZip {
  Write-Host "Building Lambda bootstrap (linux/arm64)"
  Push-Location $backendDir
  try {
    $env:GOOS = "linux"
    $env:GOARCH = "arm64"
    $env:CGO_ENABLED = "0"
    go build -tags lambda.norpc -o (Join-Path $workDir "bootstrap") ./cmd/api
    if ($LASTEXITCODE -ne 0) { throw "go build failed" }
  }
  finally {
    Remove-Item Env:GOOS -ErrorAction SilentlyContinue
    Remove-Item Env:GOARCH -ErrorAction SilentlyContinue
    Remove-Item Env:CGO_ENABLED -ErrorAction SilentlyContinue
    Pop-Location
  }
  $zipPath = Join-Path $workDir "function.zip"
  if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
  Compress-Archive -Path (Join-Path $workDir "bootstrap") -DestinationPath $zipPath -Force
  return $zipPath
}

function Ensure-Lambda {
  param([string]$RoleArn, [string]$ZipPath)
  $name = $OrbitForgeConfig.LambdaName
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  aws lambda get-function --function-name $name --profile $OrbitForgeConfig.Profile --region $OrbitForgeConfig.Region 1>$null 2>$null
  $missing = ($LASTEXITCODE -ne 0)
  $ErrorActionPreference = $prev
  $envVars = "Variables={REPOSITORY=dynamodb,FEEDBACK_TABLE=$($OrbitForgeConfig.FeedbackTable),REACTIONS_TABLE=$($OrbitForgeConfig.ReactionsTable)}"
  if ($missing) {
    Write-Host "Creating Lambda $name"
    Invoke-Aws lambda create-function `
      --function-name $name `
      --runtime provided.al2023 `
      --architectures arm64 `
      --handler bootstrap `
      --role $RoleArn `
      --zip-file "fileb://$ZipPath" `
      --timeout 15 `
      --memory-size 256 `
      --environment $envVars | Out-Null
  }
  else {
    Write-Host "Updating Lambda code $name"
    Invoke-Aws lambda update-function-code --function-name $name --zip-file "fileb://$ZipPath" | Out-Null
    Invoke-Aws lambda wait function-updated --function-name $name
    Invoke-Aws lambda update-function-configuration `
      --function-name $name `
      --runtime provided.al2023 `
      --environment $envVars | Out-Null
    Invoke-Aws lambda wait function-updated --function-name $name
  }
  $arn = Invoke-Aws lambda get-function --function-name $name --query Configuration.FunctionArn --output text
  return $arn
}

function Ensure-HttpApi {
  param([string]$LambdaArn)
  $apis = Invoke-Aws apigatewayv2 get-apis --output json | ConvertFrom-Json
  $api = $apis.Items | Where-Object { $_.Name -eq $OrbitForgeConfig.HttpApiName } | Select-Object -First 1
  if (-not $api) {
    Write-Host "Creating HTTP API"
    $api = Invoke-Aws apigatewayv2 create-api `
      --name $OrbitForgeConfig.HttpApiName `
      --protocol-type HTTP `
      --cors-configuration "AllowOrigins=*,AllowMethods=GET,POST,PUT,OPTIONS,AllowHeaders=content-type,authorization" `
      --output json | ConvertFrom-Json
  }
  else {
    Invoke-Aws apigatewayv2 update-api `
      --api-id $api.ApiId `
      --cors-configuration "AllowOrigins=*,AllowMethods=GET,POST,PUT,OPTIONS,AllowHeaders=content-type,authorization" | Out-Null
  }
  $apiId = $api.ApiId

  $integrations = Invoke-Aws apigatewayv2 get-integrations --api-id $apiId --output json | ConvertFrom-Json
  $integration = $integrations.Items | Select-Object -First 1
  if (-not $integration) {
    $integration = Invoke-Aws apigatewayv2 create-integration `
      --api-id $apiId `
      --integration-type AWS_PROXY `
      --integration-uri $LambdaArn `
      --payload-format-version "2.0" `
      --output json | ConvertFrom-Json
  }
  else {
    Invoke-Aws apigatewayv2 update-integration `
      --api-id $apiId `
      --integration-id $integration.IntegrationId `
      --integration-uri $LambdaArn | Out-Null
  }

  $routesNeeded = @(
    "GET /api/v1/health",
    "POST /api/v1/feedback",
    "GET /api/v1/articles/{slug}/reactions",
    "POST /api/v1/articles/{slug}/reactions",
    "GET /api/v1/studio/documents",
    "POST /api/v1/studio/documents",
    "POST /api/v1/studio/media",
    "ANY /api/v1/studio/{proxy+}"
  )
  $routes = Invoke-Aws apigatewayv2 get-routes --api-id $apiId --output json | ConvertFrom-Json
  foreach ($routeKey in $routesNeeded) {
    $existsRoute = $routes.Items | Where-Object { $_.RouteKey -eq $routeKey }
    if (-not $existsRoute) {
      Invoke-Aws apigatewayv2 create-route `
        --api-id $apiId `
        --route-key $routeKey `
        --target "integrations/$($integration.IntegrationId)" | Out-Null
    }
  }

  $stages = Invoke-Aws apigatewayv2 get-stages --api-id $apiId --output json | ConvertFrom-Json
  if (-not ($stages.Items | Where-Object { $_.StageName -eq '$default' })) {
    Invoke-Aws apigatewayv2 create-stage --api-id $apiId --stage-name '$default' --auto-deploy | Out-Null
  }

  $sourceArn = "arn:aws:execute-api:$($OrbitForgeConfig.Region):${accountId}:${apiId}/*/*"
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  aws lambda add-permission `
    --function-name $OrbitForgeConfig.LambdaName `
    --statement-id apigw-invoke `
    --action lambda:InvokeFunction `
    --principal apigateway.amazonaws.com `
    --source-arn $sourceArn `
    --profile $OrbitForgeConfig.Profile `
    --region $OrbitForgeConfig.Region 1>$null 2>$null
  $ErrorActionPreference = $prev

  $apiEndpoint = "https://$apiId.execute-api.$($OrbitForgeConfig.Region).amazonaws.com"
  return @{ ApiId = $apiId; Endpoint = $apiEndpoint }
}

function Ensure-SiteBucket {
  $bucket = $siteBucket
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  aws s3api head-bucket --bucket $bucket --profile $OrbitForgeConfig.Profile 1>$null 2>$null
  $missing = ($LASTEXITCODE -ne 0)
  $ErrorActionPreference = $prev
  if ($missing) {
    Write-Host "Creating bucket $bucket"
    if ($OrbitForgeConfig.Region -eq "us-east-1") {
      Invoke-Aws s3api create-bucket --bucket $bucket | Out-Null
    }
    else {
      Invoke-Aws s3api create-bucket --bucket $bucket --create-bucket-configuration LocationConstraint=$($OrbitForgeConfig.Region) | Out-Null
    }
  }
  Invoke-Aws s3api put-public-access-block `
    --bucket $bucket `
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" | Out-Null
  Invoke-Aws s3api put-bucket-ownership-controls `
    --bucket $bucket `
    --ownership-controls "Rules=[{ObjectOwnership=BucketOwnerEnforced}]" | Out-Null
}

function Ensure-Oac {
  $list = Invoke-Aws cloudfront list-origin-access-controls --output json | ConvertFrom-Json
  $existing = $null
  if ($list.OriginAccessControlList -and $list.OriginAccessControlList.Items) {
    $existing = $list.OriginAccessControlList.Items | Where-Object { $_.Name -eq $OrbitForgeConfig.OacName } | Select-Object -First 1
  }
  if ($existing) {
    return $existing.Id
  }
  $cfg = @'
{
  "Name": "orbitforge-site-oac",
  "Description": "OrbitForge S3 OAC",
  "SigningProtocol": "sigv4",
  "SigningBehavior": "always",
  "OriginAccessControlOriginType": "s3"
}
'@
  $cfgPath = Join-Path $workDir "oac.json"
  [System.IO.File]::WriteAllText($cfgPath, $cfg.Replace("orbitforge-site-oac", $OrbitForgeConfig.OacName), (New-Object System.Text.UTF8Encoding $false))
  $created = Invoke-Aws cloudfront create-origin-access-control --origin-access-control-config "file://$cfgPath" --output json | ConvertFrom-Json
  return $created.OriginAccessControl.Id
}

function Ensure-CfFunction {
  $name = $OrbitForgeConfig.CfFunctionName
  $codePath = Join-Path $PSScriptRoot "cf-index-rewrite.js"
  $code = Get-Content $codePath -Raw
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  aws cloudfront describe-function --name $name --profile $OrbitForgeConfig.Profile 1>$null 2>$null
  $missing = ($LASTEXITCODE -ne 0)
  $ErrorActionPreference = $prev
  if ($missing) {
    $configPath = Join-Path $workDir "cff-config.json"
    $config = @{ Comment = "OrbitForge index rewrite"; Runtime = "cloudfront-js-2.0" } | ConvertTo-Json -Compress
    [System.IO.File]::WriteAllText($configPath, $config, (New-Object System.Text.UTF8Encoding $false))
    Invoke-Aws cloudfront create-function --name $name --function-config "file://$configPath" --function-code "fileb://$codePath" | Out-Null
  }
  else {
    $desc = Invoke-Aws cloudfront describe-function --name $name --output json | ConvertFrom-Json
    $etag = $desc.ETag
    $configPath = Join-Path $workDir "cff-config.json"
    $config = @{ Comment = "OrbitForge index rewrite"; Runtime = "cloudfront-js-2.0" } | ConvertTo-Json -Compress
    [System.IO.File]::WriteAllText($configPath, $config, (New-Object System.Text.UTF8Encoding $false))
    Invoke-Aws cloudfront update-function --name $name --if-match $etag --function-config "file://$configPath" --function-code "fileb://$codePath" | Out-Null
  }
  $desc2 = Invoke-Aws cloudfront describe-function --name $name --output json | ConvertFrom-Json
  Invoke-Aws cloudfront publish-function --name $name --if-match $desc2.ETag | Out-Null
  $desc3 = Invoke-Aws cloudfront describe-function --name $name --stage LIVE --output json | ConvertFrom-Json
  return $desc3.FunctionSummary.FunctionMetadata.FunctionARN
}

function New-DistConfigJson {
  param(
    [string]$CallerRef,
    [string]$OacId,
    [string]$ApiHost,
    [string]$FunctionArn
  )
  $templatePath = Join-Path $PSScriptRoot "dist-config.template.json"
  $json = Get-Content $templatePath -Raw
  $s3Domain = "$siteBucket.s3.$($OrbitForgeConfig.Region).amazonaws.com"
  $json = $json.Replace("__CALLER_REF__", $CallerRef)
  $json = $json.Replace("__S3_DOMAIN__", $s3Domain)
  $json = $json.Replace("__OAC_ID__", $OacId)
  $json = $json.Replace("__API_HOST__", $ApiHost)
  $json = $json.Replace("__FUNCTION_ARN__", $FunctionArn)
  $cfgPath = Join-Path $workDir "dist-config.json"
  [System.IO.File]::WriteAllText($cfgPath, $json, (New-Object System.Text.UTF8Encoding $false))
  return $cfgPath
}

function Ensure-Distribution {
  param(
    [string]$OacId,
    [string]$ApiEndpoint,
    [string]$FunctionArn
  )

  $apiHost = ([Uri]$ApiEndpoint).Host
  $dists = Invoke-Aws cloudfront list-distributions --output json | ConvertFrom-Json
  $existing = $null
  if ($dists.DistributionList.Items) {
    $existing = $dists.DistributionList.Items | Where-Object {
      ($_.Comment -eq "OrbitForge static site") -or (
        $_.Origins.Items | Where-Object { $_.Id -eq "orbitforge-s3" }
      )
    } | Select-Object -First 1
  }

  if ($existing) {
    # Existing distribution is already wired for S3 + /api/*; avoid full config rewrite on content sync.
    Write-Host "CloudFront distribution exists: $($existing.Id)"
    return @{ Id = $existing.Id; Domain = $existing.DomainName }
  }

  $callerRef = "orbitforge-$(Get-Date -Format yyyyMMddHHmmss)"
  $cfgPath = New-DistConfigJson -CallerRef $callerRef -OacId $OacId -ApiHost $apiHost -FunctionArn $FunctionArn
  Write-Host "Creating CloudFront distribution"
  $created = Invoke-Aws cloudfront create-distribution --distribution-config "file://$cfgPath" --output json | ConvertFrom-Json
  return @{ Id = $created.Distribution.Id; Domain = $created.Distribution.DomainName }
}

function Set-BucketPolicyForOac {
  param([string]$DistributionArn)
  $policy = @"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontServicePrincipalRead",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::$siteBucket/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "$DistributionArn"
      }
    }
  }]
}
"@
  $policyPath = Join-Path $workDir "bucket-policy.json"
  [System.IO.File]::WriteAllText($policyPath, $policy, (New-Object System.Text.UTF8Encoding $false))
  Invoke-Aws s3api put-bucket-policy --bucket $siteBucket --policy "file://$policyPath" | Out-Null
}

function Sync-Frontend {
  param(
    [string]$SiteUrl,
    [string]$DistributionId
  )
  if (-not $SkipFrontendBuild) {
    Write-Host "Building frontend with NEXT_PUBLIC_SITE_URL=$SiteUrl"
    Push-Location $frontendDir
    try {
      $env:NEXT_PUBLIC_SITE_URL = $SiteUrl
      $env:NEXT_PUBLIC_API_BASE_URL = "/api/v1"
      if ($state.CognitoDomain) { $env:NEXT_PUBLIC_COGNITO_DOMAIN = $state.CognitoDomain }
      if ($state.CognitoClientId) { $env:NEXT_PUBLIC_COGNITO_CLIENT_ID = $state.CognitoClientId }
      npm run build
      if ($LASTEXITCODE -ne 0) { throw "frontend build failed" }
    }
    finally {
      Pop-Location
    }
  }
  $outDir = Join-Path $frontendDir "out"
  if (-not (Test-Path $outDir)) {
    throw "frontend/out missing; run without -SkipFrontendBuild first"
  }
  Write-Host "Syncing $outDir to s3://$siteBucket"
  Invoke-Aws s3 sync $outDir "s3://$siteBucket" --delete
  Write-Host "Creating CloudFront invalidation"
  Invoke-Aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*" | Out-Null
}

function Ensure-PrivateBucket {
  param([string]$Bucket)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  aws s3api head-bucket --bucket $Bucket --profile $OrbitForgeConfig.Profile 1>$null 2>$null
  $missing = ($LASTEXITCODE -ne 0)
  $ErrorActionPreference = $prev
  if ($missing) {
    Write-Host "Creating private bucket $Bucket"
    if ($OrbitForgeConfig.Region -eq "us-east-1") {
      Invoke-Aws s3api create-bucket --bucket $Bucket | Out-Null
    }
    else {
      Invoke-Aws s3api create-bucket --bucket $Bucket --create-bucket-configuration "LocationConstraint=$($OrbitForgeConfig.Region)" | Out-Null
    }
  }
  Invoke-Aws s3api put-public-access-block --bucket $Bucket --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" | Out-Null
}

function Ensure-Cognito {
  param([string]$CallbackUrl)
  $pools = Invoke-Aws cognito-idp list-user-pools --max-results 60 --output json | ConvertFrom-Json
  $pool = $pools.UserPools | Where-Object { $_.Name -eq $OrbitForgeConfig.CognitoPoolName } | Select-Object -First 1
  if (-not $pool) {
    Write-Host "Creating Cognito user pool"
    $pool = Invoke-Aws cognito-idp create-user-pool `
      --pool-name $OrbitForgeConfig.CognitoPoolName `
      --admin-create-user-config "AllowAdminCreateUserOnly=true" `
      --username-attributes email `
      --output json | ConvertFrom-Json
    $poolId = $pool.UserPool.Id
  }
  else {
    $poolId = $pool.Id
  }
  $clients = Invoke-Aws cognito-idp list-user-pool-clients --user-pool-id $poolId --output json | ConvertFrom-Json
  $client = $clients.UserPoolClients | Where-Object { $_.ClientName -eq "orbitforge-studio" } | Select-Object -First 1
  if (-not $client) {
    $client = Invoke-Aws cognito-idp create-user-pool-client `
      --user-pool-id $poolId `
      --client-name orbitforge-studio `
      --no-generate-secret `
      --allowed-o-auth-flows-user-pool-client `
      --allowed-o-auth-flows implicit `
      --allowed-o-auth-scopes openid email `
      --callback-urls $CallbackUrl `
      --logout-urls $CallbackUrl `
      --supported-identity-providers COGNITO `
      --output json | ConvertFrom-Json
    $clientId = $client.UserPoolClient.ClientId
  }
  else {
    $clientId = $client.ClientId
    Invoke-Aws cognito-idp update-user-pool-client `
      --user-pool-id $poolId `
      --client-id $clientId `
      --client-name orbitforge-studio `
      --allowed-o-auth-flows-user-pool-client `
      --allowed-o-auth-flows implicit `
      --allowed-o-auth-scopes openid email `
      --callback-urls $CallbackUrl `
      --logout-urls $CallbackUrl `
      --supported-identity-providers COGNITO | Out-Null
  }
  $domainPrefix = "orbitforge-$accountId"
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  aws cognito-idp describe-user-pool-domain --domain $domainPrefix --profile $OrbitForgeConfig.Profile --region $OrbitForgeConfig.Region 1>$null 2>$null
  $domainMissing = ($LASTEXITCODE -ne 0)
  $ErrorActionPreference = $prev
  if ($domainMissing) {
    Invoke-Aws cognito-idp create-user-pool-domain --user-pool-id $poolId --domain $domainPrefix | Out-Null
  }
  $email = $env:ORBITFORGE_AUTHOR_EMAIL
  $password = $env:ORBITFORGE_AUTHOR_PASSWORD
  if ($email -and $password) {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    aws cognito-idp admin-get-user --user-pool-id $poolId --username $email --profile $OrbitForgeConfig.Profile --region $OrbitForgeConfig.Region 1>$null 2>$null
    $userMissing = ($LASTEXITCODE -ne 0)
    $ErrorActionPreference = $prev
    if ($userMissing) {
      Invoke-Aws cognito-idp admin-create-user `
        --user-pool-id $poolId `
        --username $email `
        --user-attributes "Name=email,Value=$email" "Name=email_verified,Value=true" `
        --message-action SUPPRESS | Out-Null
    }
    Invoke-Aws cognito-idp admin-set-user-password `
      --user-pool-id $poolId `
      --username $email `
      --password $password `
      --permanent | Out-Null
    Write-Host "Author user ready: $email"
  }
  else {
    Write-Host "ORBITFORGE_AUTHOR_EMAIL / ORBITFORGE_AUTHOR_PASSWORD not set; pool created without a user"
  }
  $domain = "$domainPrefix.auth.$($OrbitForgeConfig.Region).amazoncognito.com"
  return @{ PoolId = $poolId; ClientId = $clientId; Domain = $domain }
}

function Ensure-CodeBuild {
  param([string]$DistributionId)
  $roleName = $OrbitForgeConfig.CodeBuildRoleName
  $roleArn = "arn:aws:iam::${accountId}:role/$roleName"
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  aws iam get-role --role-name $roleName --profile $OrbitForgeConfig.Profile 1>$null 2>$null
  $roleMissing = ($LASTEXITCODE -ne 0)
  $ErrorActionPreference = $prev
  if ($roleMissing) {
    $trust = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"codebuild.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
    $trustPath = Join-Path $workDir "codebuild-trust.json"
    [System.IO.File]::WriteAllText($trustPath, $trust, (New-Object System.Text.UTF8Encoding $false))
    Invoke-Aws iam create-role --role-name $roleName --assume-role-policy-document "file://$trustPath" | Out-Null
    Start-Sleep -Seconds 8
  }
  $policy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:$($OrbitForgeConfig.Region):${accountId}:log-group:/aws/codebuild/$($OrbitForgeConfig.CodeBuildProject):*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::$contentBucket", "arn:aws:s3:::$contentBucket/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::$siteBucket", "arn:aws:s3:::$siteBucket/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::${accountId}:distribution/$DistributionId"
    }
  ]
}
"@
  $policyPath = Join-Path $workDir "codebuild-policy.json"
  [System.IO.File]::WriteAllText($policyPath, $policy, (New-Object System.Text.UTF8Encoding $false))
  Invoke-Aws iam put-role-policy --role-name $roleName --policy-name orbitforge-publish-inline --policy-document "file://$policyPath" | Out-Null

  $stage = Join-Path $workDir "source"
  if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
  New-Item -ItemType Directory -Force -Path $stage | Out-Null
  robocopy $repoRoot $stage /E /NFL /NDL /NJH /NJS /XD node_modules .git out .work .next | Out-Null
  $zip = Join-Path $workDir "codebuild-source.zip"
  if (Test-Path $zip) { Remove-Item $zip -Force }
  Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip -Force
  Invoke-Aws s3 cp $zip "s3://$contentBucket/codebuild/source.zip"

  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  aws codebuild batch-get-projects --names $OrbitForgeConfig.CodeBuildProject --profile $OrbitForgeConfig.Profile --region $OrbitForgeConfig.Region --query "projects[0].name" --output text 1>$null 2>$null
  $exists = ($LASTEXITCODE -eq 0)
  $ErrorActionPreference = $prev
  if (-not $exists) {
    Invoke-Aws codebuild create-project `
      --name $OrbitForgeConfig.CodeBuildProject `
      --source "type=S3,location=$contentBucket/codebuild/source.zip,buildspec=infrastructure/codebuild/buildspec.yml" `
      --artifacts "type=NO_ARTIFACTS" `
      --environment "type=LINUX_CONTAINER,image=aws/codebuild/standard:7.0,computeType=BUILD_GENERAL1_SMALL,environmentVariables=[{name=CONTENT_BUCKET,value=$contentBucket},{name=SITE_BUCKET,value=$siteBucket},{name=DISTRIBUTION_ID,value=$DistributionId}]" `
      --service-role $roleArn | Out-Null
  }
  else {
    Invoke-Aws codebuild update-project `
      --name $OrbitForgeConfig.CodeBuildProject `
      --source "type=S3,location=$contentBucket/codebuild/source.zip,buildspec=infrastructure/codebuild/buildspec.yml" `
      --environment "type=LINUX_CONTAINER,image=aws/codebuild/standard:7.0,computeType=BUILD_GENERAL1_SMALL,environmentVariables=[{name=CONTENT_BUCKET,value=$contentBucket},{name=SITE_BUCKET,value=$siteBucket},{name=DISTRIBUTION_ID,value=$DistributionId}]" `
      --service-role $roleArn | Out-Null
  }
  Write-Host "CodeBuild project $($OrbitForgeConfig.CodeBuildProject) source uploaded"
}

function Update-LambdaStudioConfig {
  param($Cognito)
  $envVars = "Variables={REPOSITORY=dynamodb,FEEDBACK_TABLE=$($OrbitForgeConfig.FeedbackTable),REACTIONS_TABLE=$($OrbitForgeConfig.ReactionsTable),CONTENT_BUCKET=$contentBucket,CODEBUILD_PROJECT=$($OrbitForgeConfig.CodeBuildProject),COGNITO_USER_POOL_ID=$($Cognito.PoolId),COGNITO_CLIENT_ID=$($Cognito.ClientId),AWS_REGION=$($OrbitForgeConfig.Region)}"
  Invoke-Aws lambda update-function-configuration --function-name $OrbitForgeConfig.LambdaName --environment $envVars | Out-Null
  Invoke-Aws lambda wait function-updated --function-name $OrbitForgeConfig.LambdaName
}

# ---- main flow ----
Ensure-DynamoTable -TableName $OrbitForgeConfig.FeedbackTable -HashKey "feedbackId"
Ensure-DynamoTable -TableName $OrbitForgeConfig.ReactionsTable -HashKey "articleSlug"
$roleArn = Ensure-LambdaRole
$zip = Build-LambdaZip
$lambdaArn = Ensure-Lambda -RoleArn $roleArn -ZipPath $zip
$api = Ensure-HttpApi -LambdaArn $lambdaArn
Ensure-SiteBucket
$oacId = Ensure-Oac
$fnArn = Ensure-CfFunction
$dist = Ensure-Distribution -OacId $oacId -ApiEndpoint $api.Endpoint -FunctionArn $fnArn
$distArn = "arn:aws:cloudfront::${accountId}:distribution/$($dist.Id)"
Set-BucketPolicyForOac -DistributionArn $distArn

$siteUrl = "https://$($dist.Domain)"
Ensure-PrivateBucket -Bucket $contentBucket
Ensure-CodeBuild -DistributionId $dist.Id
$cognito = Ensure-Cognito -CallbackUrl "$siteUrl/studio/"
Update-LambdaStudioConfig -Cognito $cognito
$state.ContentBucket = $contentBucket
$state.CognitoPoolId = $cognito.PoolId
$state.CognitoClientId = $cognito.ClientId
$state.CognitoDomain = "https://$($cognito.Domain)"
Sync-Frontend -SiteUrl $siteUrl -DistributionId $dist.Id

$state.LambdaArn = $lambdaArn
$state.ApiId = $api.ApiId
$state.ApiEndpoint = $api.Endpoint
$state.DistributionId = $dist.Id
$state.DistributionDomain = $dist.Domain
$state.SiteUrl = $siteUrl
$state.OacId = $oacId
$state.UpdatedAt = (Get-Date).ToString("o")
Write-DeployState -State $state

Write-Host ""
Write-Host "Deployed OrbitForge"
Write-Host "Site URL: $siteUrl"
Write-Host "API endpoint (direct): $($api.Endpoint)"
Write-Host "State: $($OrbitForgeConfig.StateFile)"
Write-Host "Waiting for CloudFront distribution to deploy (may take several minutes)..."
Invoke-Aws cloudfront wait distribution-deployed --id $dist.Id

if (-not $SkipSmoke) {
  Write-Host "Smoke checks..."
  foreach ($path in @("/", "/articles/go-lambda-api-boundary/", "/api/v1/health")) {
    $url = "$siteUrl$path"
    try {
      $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60
      Write-Host ("{0} -> {1}" -f $url, [int]$resp.StatusCode)
    }
    catch {
      if ($_.Exception.Response) {
        Write-Host ("{0} -> {1}" -f $url, [int]$_.Exception.Response.StatusCode)
      }
      else {
        Write-Host ("{0} -> ERROR {1}" -f $url, $_.Exception.Message)
      }
    }
  }
}
