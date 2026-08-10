$ErrorActionPreference = "Stop"

if (-not (Get-Command tb -ErrorAction SilentlyContinue)) {
  throw "Tinybird CLI is required. Install it before deploying evaluation telemetry."
}

$env:PYTHONIOENCODING = "utf-8"
tb build
tb deploy
Write-Output "Evaluation telemetry deployed. Verify the evaluation_scores datasource in Tinybird before enabling production monitors."
