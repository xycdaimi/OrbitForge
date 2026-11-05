# One-shot: copy status=published MDX into the private content bucket.
# Drafts in Git are skipped. Does not publish the public site.
# Usage: powershell -File infrastructure/cli/import-content.ps1

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "config.ps1")

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$accountId = Get-AwsAccountId
$contentBucket = "$($OrbitForgeConfig.ContentBucketPrefix)-$accountId-$($OrbitForgeConfig.Region)"
$exportDir = Join-Path $PSScriptRoot ".work\content-import"
if (Test-Path $exportDir) { Remove-Item $exportDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $exportDir | Out-Null

node (Join-Path $repoRoot "frontend\scripts\import-published.mjs") `
  (Join-Path $repoRoot "frontend\content\articles") `
  $exportDir
if ($LASTEXITCODE -ne 0) { throw "import script failed" }

Write-Host "Uploading to s3://$contentBucket"
Invoke-Aws s3 sync $exportDir "s3://$contentBucket"
Write-Host "Import finished. Public pages stay unchanged until an author publishes."
