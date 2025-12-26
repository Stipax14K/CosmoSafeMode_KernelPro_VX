// simulate_all.js
// Mode Simulation : exécute tous les moteurs VX en dry-run
// Version 1.0 - Simulation Civilization Engine

const { spawn } = require("child_process");
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
  "AutoUpdate_VX.js"
];

function runEngine(engine) {
  return new Promise((resolve) => {
    const full = path.join(MODULES, engine);

    console.log(`\n▶ Simulation : ${engine}`);

    const child = spawn("node", [full, "--simulate"], {
      cwd: ROOT,
      stdio: "inherit"
    });

    child.on("exit", (code) => {
      resolve({
        engine,
        ok: code === 0,
        code
      });
    });
  });
}

(async () => {
  console.log("======================================");
  console.log("  Mode Simulation - Dry Run Engines");
  console.log("======================================");

  for (const engine of engines) {
    await runEngine(engine);
  }

  console.log("\n======================================");
  console.log("  Simulation terminée.");
  console.log("  JSON générés dans /logs");
  console.log("======================================");
})();
