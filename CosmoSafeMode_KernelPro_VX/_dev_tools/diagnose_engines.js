// diagnose_engines.js
// Analyse les moteurs VX pour détecter les erreurs de syntaxe
// Version 1.0 - Diagnostic Civilization Engine

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const MODULES = path.join(ROOT, "modules");

const engines = fs.readdirSync(MODULES).filter(f => f.endsWith("_VX.js"));

console.log("==========================================");
console.log("  Diagnostic Syntaxique des Moteurs VX");
console.log("==========================================\n");

function detectUnicode(line) {
  return /[^\x00-\x7F]/.test(line);
}

function detectUnbalancedParentheses(content) {
  let count = 0;
  for (const char of content) {
    if (char === "(") count++;
    if (char === ")") count--;
  }
  return count !== 0;
}

engines.forEach(file => {
  const full = path.join(MODULES, file);
  const content = fs.readFileSync(full, "utf8");
  const lines = content.split("\n");

  console.log(`\n=== Analyse : ${file} ===`);

  // Unicode detection
  lines.forEach((line, i) => {
    if (detectUnicode(line)) {
      console.log(`⚠ Unicode suspect ligne ${i + 1}:`, line.trim());
    }
  });

  // Parentheses balance
  if (detectUnbalancedParentheses(content)) {
    console.log("❌ Parenthèses déséquilibrées détectées !");
  } else {
    console.log("✔ Parenthèses équilibrées.");
  }
});

console.log("\n==========================================");
console.log("  Diagnostic terminé.");
console.log("==========================================");
