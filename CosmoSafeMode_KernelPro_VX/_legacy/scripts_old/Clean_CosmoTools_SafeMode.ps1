# Clean_CosmoTools_SafeMode.ps1
# ---------------------------------------------------------
# Nettoyage intelligent + validation + optimisation logs
# pour C:\CosmoTools\SafeMode
# ---------------------------------------------------------

$root = "C:\CosmoTools\SafeMode"
Write-Host "=== CLEANING COSMOTOOLS SAFEMODE VX ==="

# --- 1. Vérification des exécutables essentiels ----------------------------

$requiredExe = @(
    "SafeMode_UltraFast_VX.exe",
    "SafeMode_Debug_VX.exe",
    "SafeMode_Watchdog_VX.exe",
    "CosmoToolsLauncher.exe",
    "CosmoToolsLauncherGUI.exe"
)

foreach ($exe in $requiredExe) {
    $path = Join-Path $root $exe
    if (-not (Test-Path $path)) {
        Write-Host "❌ Manquant : $exe" -ForegroundColor Red
    }
    else {
        Write-Host "✔ OK : $exe" -ForegroundColor Green
    }
}

# --- 2. Nettoyage des fichiers inutiles ------------------------------------

$toDelete = @(
    "node_modules",
    "package.json",
    "package-lock.json",
    "Patch_CosmoToolsLauncherHTA.ps1",
    "SafeMode.exe",
    "SafeMode_Debug_VX.js",
    "SafeMode_UltraFast_VX.js",
    "SafeMode_Watchdog_VX.js",
    "safemode_core_vx.js"
)

foreach ($item in $toDelete) {
    $path = Join-Path $root $item
    if (Test-Path $path) {
        Write-Host "🗑 Suppression : $item"
        Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Optionnel : supprimer la sauvegarde du HTA
$htaBackup = Join-Path $root "CosmoToolsLauncherGUI.hta.bak"
if (Test-Path $htaBackup) {
    Write-Host "🗑 Suppression (optionnelle) : CosmoToolsLauncherGUI.hta.bak"
    Remove-Item $htaBackup -Force
}

# --- 3. Optimisation du dossier logs ---------------------------------------

$logs = Join-Path $root "logs"
if (-not (Test-Path $logs)) {
    Write-Host "❌ Dossier logs introuvable, création..."
    New-Item -ItemType Directory -Path $logs | Out-Null
}

Write-Host "✔ Optimisation des logs..."

# Supprimer les logs de plus de 7 jours
Get-ChildItem $logs -File | Where-Object {
    $_.LastWriteTime -lt (Get-Date).AddDays(-7)
} | ForEach-Object {
    Write-Host "🗑 Log ancien supprimé : $($_.Name)"
    Remove-Item $_.FullName -Force
}

# Garder les logs critiques même s'ils sont vieux
$critical = @(
    "watchdog_safemode.log",
    "safemode_ultra.log",
    "safemode_debug.log"
)

foreach ($crit in $critical) {
    $path = Join-Path $logs $crit
    if (Test-Path $path) {
        Write-Host "✔ Log critique conservé : $crit"
    }
}

# --- 4. Vérification du patch HTA ------------------------------------------

$hta = Join-Path $root "CosmoToolsLauncherGUI.hta"
if (Test-Path $hta) {
    $content = Get-Content $hta -Raw
    if ($content -match "SafeMode_Watchdog_VX.exe") {
        Write-Host "✔ HTA patché correctement (Watchdog détecté)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ HTA NON patché (SafeMode.exe encore présent)" -ForegroundColor Red
    }
}

Write-Host "=== CLEANUP TERMINÉ ===" -ForegroundColor Cyan
