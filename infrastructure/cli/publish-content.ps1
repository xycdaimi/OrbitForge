# Publish static site content only (no Lambda / DynamoDB / API changes)
# Usage: powershell -File infrastructure/cli/publish-content.ps1
# Requires infrastructure/cli/state.json from a prior full deploy.ps1 run.

param(
  [switch]$SkipBuild,
  [switch]$SkipSmoke,
  [string]$SmokeArticleSlug = "go-lambda-api-boundary"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "config.ps1")

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$frontendDir = Join-Path $repoRoot "frontend"

$env:AWS_PROFILE = $OrbitForgeConfig.Profile
$env:AWS_DEFAULT_REGION = $OrbitForgeConfig.Region

if (-not (Test-Path $OrbitForgeConfig.StateFile)) {
  throw "Missing $($OrbitForgeConfig.StateFile). Run infrastructure/cli/deploy.ps1 once before publish-content."
}

$state = Read-DeployState
$siteBucket = [string]$state.SiteBucket
$distributionId = [string]$state.DistributionId
$siteUrl = [string]$state.SiteUrl

if (-not $siteBucket -or -not $distributionId -or -not $siteUrl) {
  throw "state.json is incomplete (need SiteBucket, DistributionId, SiteUrl). Re-run deploy.ps1."
}

Write-Host "Content publish -> bucket=$siteBucket distribution=$distributionId"
Write-Host "Site URL: $siteUrl"

if (-not $SkipBuild) {
  Write-Host "Building frontend with NEXT_PUBLIC_SITE_URL=$siteUrl"
  Push-Location $frontendDir
  try {
    $env:NEXT_PUBLIC_SITE_URL = $siteUrl
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
  throw "frontend/out missing; run without -SkipBuild first"
}

Write-Host "Syncing $outDir to s3://$siteBucket"
Invoke-Aws s3 sync $outDir "s3://$siteBucket" --delete
Write-Host "Creating CloudFront invalidation"
Invoke-Aws cloudfront create-invalidation --distribution-id $distributionId --paths "/*" | Out-Null

$state.UpdatedAt = (Get-Date).ToString("o")
$state.LastContentPublishAt = $state.UpdatedAt
Write-DeployState -State $state

Write-Host ""
Write-Host "Content published"
Write-Host "Site URL: $siteUrl"

if (-not $SkipSmoke) {
  Write-Host "Smoke checks (CDN may take a minute)..."
  Start-Sleep -Seconds 8
  $paths = @("/", "/articles/$SmokeArticleSlug/", "/rss.xml")
  foreach ($path in $paths) {
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
