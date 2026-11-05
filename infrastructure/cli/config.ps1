$ErrorActionPreference = "Stop"

$script:OrbitForgeConfig = @{
  Profile          = if ($env:AWS_PROFILE) { $env:AWS_PROFILE } else { "xyc" }
  Region           = if ($env:AWS_DEFAULT_REGION) { $env:AWS_DEFAULT_REGION } else { "us-west-2" }
  ProjectPrefix    = "orbitforge"
  SiteBucketPrefix    = "orbitforge-site"
  ContentBucketPrefix = "orbitforge-content"
  CodeBuildProject    = "orbitforge-publish"
  CodeBuildRoleName   = "orbitforge-publish-role"
  CognitoPoolName     = "orbitforge-authors"
  LambdaName       = "orbitforge-api"
  LambdaRoleName   = "orbitforge-api-role"
  HttpApiName      = "orbitforge-http-api"
  FeedbackTable    = "OrbitForgeFeedback"
  ReactionsTable   = "OrbitForgeReactions"
  OacName          = "orbitforge-site-oac"
  CfFunctionName   = "orbitforge-index-rewrite"
  StateFile        = Join-Path $PSScriptRoot "state.json"
}

function Get-AwsAccountId {
  aws sts get-caller-identity --profile $OrbitForgeConfig.Profile --query Account --output text
}

function Invoke-Aws {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  & aws @Args --profile $OrbitForgeConfig.Profile --region $OrbitForgeConfig.Region
  if ($LASTEXITCODE -ne 0) {
    throw "aws $($Args -join ' ') failed with exit code $LASTEXITCODE"
  }
}

function Read-DeployState {
  $state = [ordered]@{}
  if (-not (Test-Path $OrbitForgeConfig.StateFile)) {
    return $state
  }
  $raw = Get-Content $OrbitForgeConfig.StateFile -Raw | ConvertFrom-Json
  foreach ($prop in $raw.PSObject.Properties) {
    $state[$prop.Name] = $prop.Value
  }
  return $state
}

function Write-DeployState {
  param($State)
  $json = $State | ConvertTo-Json -Depth 8
  [System.IO.File]::WriteAllText($OrbitForgeConfig.StateFile, $json, (New-Object System.Text.UTF8Encoding $false))
}
