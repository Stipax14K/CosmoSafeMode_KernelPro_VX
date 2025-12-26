@echo off
title CosmoSafeMode Kernel Pro - VX Edition
echo ==========================================
echo   CosmoSafeMode Kernel Pro - VX Edition
echo   START ALL (Windows)
echo ==========================================
echo.

REM Vérification Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installé.
    pause
    exit /b
)

echo [OK] Node.js détecté.
echo.

REM Lancement du Control Center
echo [INFO] Lancement du Control Center VX...
start "" cmd /c "node ControlCenter\ControlCenter_Server_VX.js"

echo [INFO] Ouverture du navigateur...
start http://localhost:3080/

echo.
echo ==========================================
echo   Systeme lance avec succes
echo ==========================================
pause
