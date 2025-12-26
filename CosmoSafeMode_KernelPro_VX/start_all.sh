#!/bin/bash

echo "=========================================="
echo "  CosmoSafeMode Kernel Pro - VX Edition"
echo "  START ALL (Linux/macOS)"
echo "=========================================="
echo ""

# Vérification Node.js
if ! command -v node &> /dev/null
then
    echo "[ERREUR] Node.js n'est pas installé."
    exit
fi

echo "[OK] Node.js détecté."
echo ""

# Lancement du Control Center
echo "[INFO] Lancement du Control Center VX..."
node ControlCenter/ControlCenter_Server_VX.js &

sleep 2

echo "[INFO] Ouverture du navigateur..."
if command -v xdg-open &> /dev/null
then
    xdg-open http://localhost:3080/
elif command -v open &> /dev/null
then
    open http://localhost:3080/
fi

echo ""
echo "=========================================="
echo "  Systeme lance avec succes"
echo "=========================================="
