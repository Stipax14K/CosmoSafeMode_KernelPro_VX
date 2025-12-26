# Clean_CosmoTools_SafeMode_V2.ps1
# ---------------------------------------------------------
# Version corrigée : vérifie correctement le patch du HTA
# ---------------------------------------------------------

$root = "C:\CosmoTools\SafeMode"
$hta = Join-Path $root "CosmoToolsLauncherGUI.hta"

Write-Host "=== VALIDATION COSMOTOOLS SAFEMODE VX ==="

# Vérifier que SafeMode.exe n'existe plus
$oldSafeMode = Join-Path $root "SafeMode.exe"
if (Test-Path $oldSafeMode) {
    Write-Host "❌ Ancien SafeMode.exe encore présent" -ForegroundColor Red
}
else {
    Write-Host "✔ Ancien SafeMode.exe supprimé" -ForegroundColor Green
}

# Vérifier que Watchdog existe
$watchdog = Join-Path $root "SafeMode_Watchdog_VX.exe"
if (-not (Test-Path $watchdog)) {
    Write-Host "❌ SafeMode_Watchdog_VX.exe manquant" -ForegroundColor Red
}
else {
    Write-Host "✔ SafeMode_Watchdog_VX.exe présent" -ForegroundColor Green
}

# Vérifier le contenu du HTA
$content = Get-Content $hta -Raw

if ($content -match "SafeMode\.exe") {
    Write-Host "❌ Le HTA contient encore 'SafeMode.exe'" -ForegroundColor Red
}
else {
    Write-Host "✔ Le HTA ne contient plus 'SafeMode.exe'" -ForegroundColor Green
}

Write-Host "=== VALIDATION TERMINÉE ===" -ForegroundColor Cyan
