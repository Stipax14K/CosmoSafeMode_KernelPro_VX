// patch_all.js
// Applique tous les patchs automatiquement

const { spawnSync } = require("child_process");
const path = require("path");

function run(script) {
  console.log("\n▶ Exécution :", script);
  spawnSync("node", [path.join(__dirname, script)], { stdio: "inherit" });
}

console.log("======================================");
console.log("  VX Patch Engine - Auto Fix");
console.log("======================================");

run("patch_nexus.js");
run("patch_meta.js");

console.log("\n======================================");
console.log("  Tous les patchs ont été appliqués.");
console.log("======================================");
