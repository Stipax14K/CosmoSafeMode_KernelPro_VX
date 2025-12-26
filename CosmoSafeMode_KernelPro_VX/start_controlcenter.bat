@echo off
title Control Center VX - CosmoSafeMode Kernel Pro
echo ================================================
echo   Control Center VX - CosmoSafeMode Kernel Pro
echo   Lancement du serveur local...
echo ================================================
echo.

REM Aller dans le dossier du Control Center
cd /d "%~dp0ControlCenter_VX"

REM Lancer le serveur Node
node ControlCenter_Server_VX.js

pause
