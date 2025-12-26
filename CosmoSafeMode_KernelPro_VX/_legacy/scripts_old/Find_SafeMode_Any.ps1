# Find_SafeMode_Any.ps1
# ---------------------------------------------------------
# Affiche toutes les lignes contenant "SafeMode"
# (avec ou sans .exe)
# ---------------------------------------------------------

$htaPath = "C:\CosmoTools\SafeMode\CosmoToolsLauncherGUI.hta"

if (-not (Test-Path $htaPath)) {
    Write-Host "❌ Fichier HTA introuvable : $htaPath"
    exit
}

$lines = Get-Content $htaPath

Write-Host "=== Recherche de 'SafeMode' (toutes formes) dans le HTA ===" -ForegroundColor Cyan

$found = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "SafeMode") {
        $found = $true
        Write-Host ""
        Write-Host "----------------------------------------" -ForegroundColor Yellow
        Write-Host "Ligne $($i+1) :" -ForegroundColor Green
        Write-Host $lines[$i] -ForegroundColor White
    }
}

if (-not $found) {
    Write-Host "✔ Aucune occurrence trouvée (le HTA est totalement propre)" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "⚠ Des occurrences ont été trouvées ci-dessus." -ForegroundColor Red
    Write-Host "   Envoie-moi ces lignes et je te génère le patch exact." -ForegroundColor Yellow
}
