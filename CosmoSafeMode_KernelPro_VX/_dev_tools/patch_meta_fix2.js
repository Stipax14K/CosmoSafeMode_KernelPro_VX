// patch_meta_fix2.js
// Corrige la ligne tronquée "fs.writeFileSync(outFile" dans MetaStabilizer_VX.js

const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "modules", "MetaStabilizer_VX.js");
let content = fs.readFileSync(file, "utf8");

// Ligne fautive exacte
const badLine = "fs.writeFileSync(outFile";

// Ligne correcte complète
const goodLine = `fs.writeFileSync(outFile, JSON.stringify(report, null, 2), "utf8");`;

// Remplacement
if (content.includes(badLine)) {
  content = content.replace(badLine, goodLine);
  fs.writeFileSync(file, content, "utf8");
  console.log("✔ MetaStabilizer_VX.js corrigé (ligne writeFileSync restaurée).");
} else {
  console.log("✔ Aucun problème détecté : la ligne fautive n'a pas été trouvée.");
}
