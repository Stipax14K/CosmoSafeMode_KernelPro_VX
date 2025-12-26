# Patch_CosmoToolsLauncherHTA_V2.ps1
# --------------------------------------------------------------------
# Patch intelligent du fichier CosmoToolsLauncherGUI.hta
# Remplace TOUTES les occurrences de SafeMode.exe par SafeMode_Watchdog_VX.exe
# et ajuste les modes (debug / ultra) selon les boutons.
# --------------------------------------------------------------------

$htaPath = "C:\CosmoTools\SafeMode\CosmoToolsLauncherGUI.hta"

if (-not (Test-Path $htaPath)) {
    Write-Host "❌ Fichier HTA introuvable : $htaPath"
    exit
}

# Sauvegarde
$backup = "$htaPath.bak2"
Copy-Item $htaPath $backup -Force
Write-Host "✔ Sauvegarde créée : $backup"

# Lecture
$content = Get-Content $htaPath -Raw

# --- Remplacements universels ----------------------------------------------

# 1) Remplacer toutes les occurrences directes
$content = $content -replace "SafeMode\.exe", "SafeMode_Watchdog_VX.exe"

# 2) Remplacer les constructions dynamiques du type:
#    var exe = "SafeMode.exe";
$content = $content -replace 'var exe\s*=\s*"SafeMode_Watchdog_VX\.exe"', 'var exe = "SafeMode_Watchdog_VX.exe"'

# 3) Remplacer les commandes Run("SafeMode.exe ...")
$content = $content -replace 'Run\("SafeMode_Watchdog_VX\.exe', 'Run("SafeMode_Watchdog_VX.exe'

# 4) Remplacer les modes associés
#    Mode profond → debug
$content = $content -replace '--mode=ultra', '--mode=debug'

#    Mode rapide → ultra
$content = $content -replace '--mode=fast', '--mode=ultra'

#    Mode deep → ultra
$content = $content -replace '--mode=deep', '--mode=ultra'

# 5) Remplacer les constructions du type:
#    cmd = exe + " --path=... --mode=ultra"
$content = $content -replace '--mode="\+mode\+"', '--mode=ultra'

# 6) Remplacer les appels dans les boutons HTML
$content = $content -replace 'SafeMode_Watchdog_VX\.exe.+?simulate', 'SafeMode_Watchdog_VX.exe --mode=debug'
$content = $content -replace 'SafeMode_Watchdog_VX\.exe.+?apply', 'SafeMode_Watchdog_VX.exe --mode=ultra'
$content = $content -replace 'SafeMode_Watchdog_VX\.exe.+?patch', 'SafeMode_Watchdog_VX.exe --mode=ultra'

# --------------------------------------------------------------------

# Écriture
Set-Content -Path $htaPath -Value $content -Encoding UTF8

Write-Host "✔ Patch V2 appliqué avec succès."
Write-Host "✔ CosmoToolsLauncherGUI.hta mis à jour."
Write-Host "✔ Toutes les occurrences SafeMode.exe → SafeMode_Watchdog_VX.exe"
Write-Host "✔ Modes ajustés (debug / ultra)"
Write-Host "✔ Vérifie maintenant avec Clean_CosmoTools_SafeMode.ps1"
