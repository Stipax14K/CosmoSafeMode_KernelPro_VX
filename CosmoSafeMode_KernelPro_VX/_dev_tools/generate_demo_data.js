// generate_demo_data.js
// Génère des JSON fictifs pour le Mode Démo
// Version 1.0 - Demo Civilization Engine

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const LOGS = path.join(ROOT, "logs");

function writeJson(name, data) {
  const file = path.join(LOGS, name);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  console.log("✔ Généré :", name);
}

function randomScore() {
  const score = Math.floor(Math.random() * 40) + 60; // 60–100
  return {
    score,
    rating:
      score >= 90 ? "excellent" :
      score >= 75 ? "good" :
      score >= 60 ? "medium" : "fragile"
  };
}

function randomRisk() {
  const levels = ["low", "moderate", "critical"];
  const pick = levels[Math.floor(Math.random() * levels.length)];
  return {
    riskLevel: pick,
    details: `Risque évalué comme ${pick} en mode démo`
  };
}

// ===============================
// NEXUS
// ===============================
writeJson("nexus_map.json", {
  globalScore: randomScore(),
  modules: {
    system: randomScore(),
    network: randomScore(),
    integrity: randomScore()
  },
  summary: "Analyse Nexus fictive générée en mode démo."
});

// ===============================
// META STABILIZER
// ===============================
writeJson("meta_stability_map.json", {
  stabilityScore: randomScore(),
  riskMap: randomRisk(),
  recommendations: [
    "Optimiser les modules critiques.",
    "Vérifier la cohérence des dépendances.",
    "Ajuster les paramètres de stabilité."
  ]
});

// ===============================
// SELFREPAIR
// ===============================
writeJson("selfrepair_map.json", {
  selfRepairScore: randomScore(),
  riskMap: randomRisk(),
  actions: [
    "Réparation logique simulée.",
    "Nettoyage des modules fictifs.",
    "Stabilisation virtuelle."
  ]
});

// ===============================
// KERNEL RESILIENCE
// ===============================
writeJson("kernel_resilience_map.json", {
  analytics: {
    resilienceScore: randomScore(),
    riskMap: randomRisk()
  },
  history: [
    { event: "Boot stable", score: 92 },
    { event: "Scan fictif", score: 88 }
  ]
});

// ===============================
// ORCHESTRATOR
// ===============================
writeJson("orchestrator_map.json", {
  globalRisk: randomRisk(),
  pipeline: [
    "Scan fictif",
    "Analyse fictive",
    "Réparation fictive",
    "Validation fictive"
  ]
});

// ===============================
// RECOVERY KERNEL
// ===============================
writeJson("recovery_map.json", {
  recoveryScore: randomScore(),
  riskMap: randomRisk(),
  recoveryPlan: [
    "Étape 1 : Analyse fictive",
    "Étape 2 : Reconstruction virtuelle",
    "Étape 3 : Validation simulée"
  ]
});

// ===============================
// AUTOUPDATE
// ===============================
writeJson("autoupdate_map.json", {
  analytics: {
    updateScore: randomScore(),
    riskMap: randomRisk()
  },
  updates: [
    "Module A mis à jour (fictif)",
    "Module B mis à jour (fictif)"
  ]
});

console.log("\n======================================");
console.log("  Mode Démo : JSON générés avec succès");
console.log("======================================");
