// patch_nexus.js
// Corrige la ligne Unicode fautive dans NexusInspector_VX.js

const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "modules", "NexusInspector_VX.js");
let content = fs.readFileSync(file, "utf8");

const badLine = "– SCORING ENGINE"; // tiret long Unicode
const goodLine = "// SCORING ENGINE";

if (content.includes(badLine)) {
  content = content.replace(badLine, goodLine);
  fs.writeFileSync(file, content, "utf8");
  console.log("✔ NexusInspector_VX.js corrigé (tiret Unicode remplacé).");
} else {
  console.log("✔ Aucun problème détecté dans NexusInspector_VX.js.");
}
