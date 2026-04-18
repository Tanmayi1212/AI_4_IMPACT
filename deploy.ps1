param(
	[switch]$AllowStaticDeploy
)

# Build and deploy a static export (no Cloud Functions / server runtime)
# Guarded by explicit opt-in to avoid taking down admin server APIs during live registrations.
if (-not $AllowStaticDeploy) {
	throw "Static export deploy is blocked by default for production safety. Re-run with -AllowStaticDeploy only for deliberate static-only maintenance windows."
}

$apiPath = "src/app/api"
$apiBackupPath = "src/app/__api_runtime_backup"
$middlewarePath = "middleware.js"
$middlewareBackupPath = "middleware.runtime.backup.js"

$nextDevRunning = $false
try {
	$nodeProcesses = Get-CimInstance Win32_Process -Filter "Name='node.exe'"
	$nextDevRunning = $nodeProcesses | Where-Object { $_.CommandLine -match "next(\.js)?\s+dev" }
}
catch {
	$nextDevRunning = $false
}

if ($nextDevRunning) {
	throw "Detected a running Next.js dev server. Stop localhost dev before deploy to avoid temporary file-move conflicts."
}

if ((Test-Path $apiBackupPath) -and (-not (Test-Path $apiPath))) {
	Move-Item -Path $apiBackupPath -Destination $apiPath -ErrorAction Stop
}

if ((Test-Path $middlewareBackupPath) -and (-not (Test-Path $middlewarePath))) {
	Move-Item -Path $middlewareBackupPath -Destination $middlewarePath -ErrorAction Stop
}

if ((Test-Path $apiBackupPath) -and (Test-Path $apiPath)) {
	Remove-Item -Recurse -Force $apiBackupPath -ErrorAction Stop
}

if ((Test-Path $middlewareBackupPath) -and (Test-Path $middlewarePath)) {
	Remove-Item -Force $middlewareBackupPath -ErrorAction Stop
}

if (Test-Path $apiPath) {
	Move-Item -Path $apiPath -Destination $apiBackupPath -ErrorAction Stop
}

if (Test-Path $middlewarePath) {
	Move-Item -Path $middlewarePath -Destination $middlewareBackupPath -ErrorAction Stop
}

$exitCode = 0

try {
	Write-Host "Building static Next.js export..." -ForegroundColor Cyan
	$env:STATIC_EXPORT = "true"
	npm run build

	if ($LASTEXITCODE -ne 0) {
		throw "Build failed."
	}

	if (-not (Test-Path out)) {
		throw "Static export folder 'out' not found."
	}

	Write-Host "Deploying static site to Firebase Hosting..." -ForegroundColor Green
	if (Get-Command firebase -ErrorAction SilentlyContinue) {
		firebase deploy --only hosting --project ai4impact-cc315 --non-interactive --force
	}
	else {
		npx firebase-tools deploy --only hosting --project ai4impact-cc315 --non-interactive --force
	}

	if ($LASTEXITCODE -ne 0) {
		throw "Firebase deploy failed."
	}

	Write-Host "Deployment complete." -ForegroundColor Green
}
catch {
	Write-Host $_.Exception.Message -ForegroundColor Red
	$exitCode = 1
}
finally {
	Remove-Item Env:STATIC_EXPORT -ErrorAction SilentlyContinue

	if ((Test-Path $apiPath) -and (Test-Path $apiBackupPath)) {
		Remove-Item -Recurse -Force $apiPath -ErrorAction Stop
	}

	if ((Test-Path $middlewarePath) -and (Test-Path $middlewareBackupPath)) {
		Remove-Item -Force $middlewarePath -ErrorAction Stop
	}

	if (Test-Path $apiBackupPath) {
		Move-Item -Path $apiBackupPath -Destination $apiPath -ErrorAction Stop
	}

	if (Test-Path $middlewareBackupPath) {
		Move-Item -Path $middlewareBackupPath -Destination $middlewarePath -ErrorAction Stop
	}
}

if ($exitCode -ne 0) {
	exit $exitCode
}