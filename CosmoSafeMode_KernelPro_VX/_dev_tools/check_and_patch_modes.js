// check_and_patch_modes.js
// Vérifie et corrige automatiquement la présence des modes Simulation et Démo
// Version 1.0 - VX Integrity Patcher

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const MODULES = path.join(ROOT, "modules");

const engines = [
  "NexusInspector_VX.js",
  "MetaStabilizer_VX.js",
  "SelfRepair_VX.js",
  "KernelResilience_VX.js",
  "CosmoOrchestrator_VX.js",
  "RecoveryKernel_VX.js",
  "AutoUpdate_VX.js",
  "SafeMode_Watchdog_VX.js"
];

// ===============================
// BLOCS À INSÉRER
// ===============================

const SIMULATE_BLOCK = `// Mode Simulation
const SIMULATE = process.argv.includes("--simulate");

if (SIMULATE) {
  console.log("[SIMULATION] Mode simulation activé pour ce moteur.");

  const fs = require("fs");
  const path = require("path");
  const LOGS = path.join(process.cwd(), "logs");

  const output = {
    simulated: true,
    engine: path.basename(__filename),
    generatedAt: new Date().toISOString(),
    score: Math.floor(Math.random() * 40) + 60,
    risk: ["low", "moderate", "critical"][Math.floor(Math.random() * 3)],
    notes: "Simulation dry-run"
  };

  const fileName = path.basename(__filename).replace(".js", "_simulated.json");
  const full = path.join(LOGS, fileName);

  fs.writeFileSync(full, JSON.stringify(output, null, 2), "utf8");

  console.log("[SIMULATION] JSON simulé généré :", fileName);
  process.exit(0);
}
`;

const DEMO_BLOCK = `
// Mode Démo
const CONFIG = JSON.parse(fs.readFileSync(path.join(process.cwd(), "config.json"), "utf8"));

if (CONFIG.demoMode === true) {
  console.log("[DEMO] Mode Démo activé pour ce moteur.");

  const output = {
    demo: true,
    engine: path.basename(__filename),
    generatedAt: new Date().toISOString(),
    score: 88,
    risk: "moderate",
    details: "Analyse fictive en mode démonstration."
  };

  const file = path.join(process.cwd(), "logs", path.basename(__filename).replace(".js", "_demo.json"));
  fs.writeFileSync(file, JSON.stringify(output, null, 2), "utf8");

  console.log("[DEMO] JSON démo généré :", file);
  process.exit(0);
}
`;

// ===============================
// FONCTION DE PATCH
// ===============================

function patchEngine(fileName) {
  const full = path.join(MODULES, fileName);
  let content = fs.readFileSync(full, "utf8");

  const hasSimulate = content.includes("Mode Simulation");
  const hasDemo = content.includes("Mode Démo");

  console.log(`\n=== Vérification : ${fileName} ===`);

  if (hasSimulate && hasDemo) {
    console.log("✔ OK, les deux modes sont présents.");
    return;
  }

  console.log("❌ Modes manquants, correction en cours...");

  let newContent = content;

  // Insérer Simulation tout en haut
  if (!hasSimulate) {
    newContent = SIMULATE_BLOCK + "\n" + newContent;
    console.log("→ Mode Simulation ajouté.");
  }

  // Insérer Démo juste après Simulation
  if (!hasDemo) {
    newContent = newContent.replace(SIMULATE_BLOCK, SIMULATE_BLOCK + "\n" + DEMO_BLOCK);
    console.log("→ Mode Démo ajouté.");
  }

  fs.writeFileSync(full, newContent, "utf8");
  console.log("✔ Correction appliquée.");
}

// ===============================
// EXECUTION
// ===============================

console.log("==========================================");
console.log("  VX Integrity Patcher - Vérification Modes");
console.log("==========================================");

engines.forEach(patchEngine);

console.log("\n==========================================");
console.log("  Vérification et corrections terminées.");
console.log("==========================================");
