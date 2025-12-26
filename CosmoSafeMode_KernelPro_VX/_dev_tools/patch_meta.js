// patch_meta.js
// Corrige la parenthèse manquante dans MetaStabilizer_VX.js

const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "modules", "MetaStabilizer_VX.js");
let content = fs.readFileSync(file, "utf8");

// On cherche la ligne problématique
const regex = /fs\.writeFileSync\(outFile[\s\S]*?\n/;

// On remplace par une version correcte
const fixed = `fs.writeFileSync(outFile, JSON.stringify(report, null, 2), "utf8");\n`;

if (regex.test(content)) {
  content = content.replace(regex, fixed);
  fs.writeFileSync(file, content, "utf8");
  console.log("✔ MetaStabilizer_VX.js corrigé (parenthèse restaurée).");
} else {
  console.log("✔ Aucun problème détecté dans MetaStabilizer_VX.js.");
}
