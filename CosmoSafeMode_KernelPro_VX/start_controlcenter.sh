#!/bin/bash

echo "==============================================="
echo "  Control Center VX - CosmoSafeMode Kernel Pro"
echo "  Lancement du serveur local..."
echo "==============================================="
echo ""

# Aller dans le dossier du Control Center
cd "$(dirname "$0")/ControlCenter_VX"

# Lancer le serveur Node
node ControlCenter_Server_VX.js
