param(
  [string]$ProjectId = "ai4impact-cc315",
  [string]$BackendUrl = "https://ai4impact-backend--ai4impact-cc315.us-central1.hosted.app",
  [string]$WebUrl = "https://ai4impact.web.app",
  [switch]$SkipPrecheck
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Label,
    [Parameter(Mandatory = $true)]
    [scriptblock]$Action
  )

  Write-Host "`n==> $Label" -ForegroundColor Cyan
  & $Action

  if ($LASTEXITCODE -ne 0) {
    throw "$Label failed with exit code $LASTEXITCODE"
  }
}

if (-not $SkipPrecheck) {
  Invoke-Step -Label "Precheck backend runtime health" -Action {
    npm run health:runtime -- $BackendUrl
  }
}

Invoke-Step -Label "Deploy hosting runtime API rewrite config" -Action {
  npx firebase-tools deploy --project $ProjectId --only hosting --config firebase.runtime-api-rewrite.json --non-interactive
}

try {
  Invoke-Step -Label "Post-deploy production runtime health" -Action {
    npm run health:runtime -- $WebUrl
  }

  Write-Host "`nCutover successful. Production runtime API checks passed." -ForegroundColor Green
}
catch {
  Write-Host "`nPost-deploy checks failed. Rolling back to stable static hosting config..." -ForegroundColor Yellow

  npx firebase-tools deploy --project $ProjectId --only hosting --config firebase.static-hosting.json --non-interactive

  if ($LASTEXITCODE -ne 0) {
    throw "Rollback failed after failed cutover: $($_.Exception.Message)"
  }

  throw "Cutover failed and rollback applied. Details: $($_.Exception.Message)"
}
