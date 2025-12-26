// check_vx.js
// Vérification automatique du packaging VX
// Version 1.0 - Civilizational Integrity Checker

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function checkFile(p) {
  if (!exists(p)) {
    console.log("❌ Fichier manquant :", p);
    return false;
  }
  console.log("✔ Fichier OK :", p);
  return true;
}

function checkDir(p) {
  if (!exists(p)) {
    console.log("❌ Dossier manquant :", p);
    return false;
  }
  console.log("✔ Dossier OK :", p);
  return true;
}

function checkJson(p) {
  const full = path.join(ROOT, p);
  if (!exists(p)) {
    console.log("❌ JSON manquant :", p);
    return false;
  }
  try {
    JSON.parse(fs.readFileSync(full, "utf8"));
    console.log("✔ JSON valide :", p);
    return true;
  } catch (e) {
    console.log("❌ JSON invalide :", p, "→", e.message);
    return false;
  }
}

console.log("==========================================");
console.log("  CosmoSafeMode Kernel Pro - VX Checker");
console.log("==========================================\n");

// Vérification structure
checkDir("modules");
checkDir("ControlCenter");
checkDir("ControlCenter/public");
checkDir("plugins");
checkDir("logs");
checkDir("_legacy");
checkDir("bin");

// Vérification fichiers Control Center
checkFile("ControlCenter/ControlCenter_Server_VX.js");
checkFile("ControlCenter/public/index.html");
checkFile("ControlCenter/public/main.js");
checkFile("ControlCenter/public/styles.css");
checkFile("simulate_all.js");

// Vérification config
checkJson("config.json");

// Vérification JSON logs
[
  "nexus_map.json",
  "meta_stability_map.json",
  "selfrepair_map.json",
  "kernel_resilience_map.json",
  "orchestrator_map.json",
  "recovery_map.json",
  "autoupdate_map.json"
].forEach(f => checkJson("logs/" + f));

// Vérification modules
[
  "AutoUpdate_VX.js",
  "CosmoOrchestrator_VX.js",
  "KernelResilience_VX.js",
  "MetaStabilizer_VX.js",
  "NexusInspector_VX.js",
  "RecoveryKernel_VX.js",
  "SafeMode_Watchdog_VX.js",
  "SelfRepair_VX.js"
].forEach(f => checkFile("modules/" + f));

// Vérification plugins
checkDir("plugins/recovery");
checkDir("plugins/resilience");
checkDir("plugins/update");

// Vérification bin (doit être vide)
const binFiles = fs.readdirSync(path.join(ROOT, "bin"));
if (binFiles.length === 0) {
  console.log("✔ /bin est vide (normal pour VX v3.0)");
} else {
  console.log("❌ /bin contient des fichiers inattendus :", binFiles);
}

// Vérification legacy
[
  "exe_old",
  "js_old",
  "json_old",
  "logs_old",
  "scripts_old",
  "txt_old",
  "hta_old"
].forEach(d => checkDir("_legacy/" + d));

console.log("\n==========================================");
console.log(" Vérification terminée.");
console.log("==========================================");
