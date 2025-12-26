// MetaStabilizer_VX.js
// CosmoSafeMode Kernel Pro - MetaStabilizer VX
// v3.0 - Stability Civilization Engine
//
// RÔLE :
// - Lire automatiquement tous les *_map.json dans /logs
// - Fusionner les analyses (Nexus, Kernel, Repair, etc.)
// - Appliquer des règles de stabilité multi-couches
// - Appliquer des heuristiques, corrélations, prédictions
// - Générer un Stability Score + sous-scores
// - Générer un Stability Action Graph (actions immédiates, critiques, préventives)
// - Générer une Critical Risk Map
// - Charger des plugins de stabilité
// - Générer un rapport JSON civilisationnel
// - Fournir des recommandations textuelles premium
//
// Usage :
//   MetaStabilizer_VX.exe --path="C:\\CosmoCodeUniverse"
//   MetaStabilizer_VX.exe --path="C:\\Projet" --plugins=on

// Mode Simulation
const SIMULATE = process.argv.includes("--simulate");

if (SIMULATE) {
  console.log("[SIMULATION] Mode simulation activé pour ce moteur.");

  // Exemple de JSON simulé
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

const fs = require("fs");
const path = require("path");

// =========================
// CONFIG PRODUIT
// =========================

const PRODUCT = {
  name: "MetaStabilizer VX",
  version: "3.0.0",
  engine: "Stability Civilization Engine",
};

const DEFAULTS = {
  plugins: true,
  mapsPattern: "_map.json",
};

// =========================
// LOGGING PREMIUM
// =========================

function ensureLogsDir() {
  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  return logsDir;
}

function log(level, msg) {
  const logsDir = ensureLogsDir();
  const logFile = path.join(logsDir, "metastabilizer_vx.log");
  const ts = new Date().toISOString();
  const prefix = {
    info: "[INFO]",
    warn: "[WARN]",
    error: "[ERROR]",
    debug: "[DEBUG]",
  }[level] || "[INFO]";

  const line = `[${ts}] ${prefix} ${msg}`;
  fs.appendFileSync(logFile, line + "\n");
  console.log(line);
}

const logInfo = (m) => log("info", m);
const logWarn = (m) => log("warn", m);
const logError = (m) => log("error", m);
const logDebug = (m) => log("debug", m);

// =========================
// ARGUMENTS
// =========================

function parseArgs(argv) {
  const result = {};
  argv.forEach((arg) => {
    const [k, v] = arg.split("=");
    if (k && k.startsWith("--")) result[k.slice(2)] = v === undefined ? true : v;
  });
  return result;
}

// =========================
// MAP LOADER (CIVILIZATIONNEL)
// =========================

function loadAllMaps() {
  const logsDir = ensureLogsDir();
  const files = fs.readdirSync(logsDir).filter((f) => f.endsWith(DEFAULTS.mapsPattern));

  const maps = [];
  for (const file of files) {
    const full = path.join(logsDir, file);
    try {
      const json = JSON.parse(fs.readFileSync(full, "utf8"));
      maps.push({
        name: file,
        data: json,
      });
      logInfo(`Map chargée : ${file}`);
    } catch (e) {
      logError(`Erreur lecture map ${file} : ${e.message}`);
    }
  }

  if (maps.length === 0) {
    logWarn("Aucune map *_map.json trouvée dans /logs.");
  }

  return maps;
}

// =========================
// STABILITY CORE ENGINE
// =========================

function computeCoreMetrics(maps) {
  const metrics = {
    totalFiles: 0,
    totalDirs: 0,
    totalSize: 0,
    anomalies: [],
    extensions: {},
  };

  for (const m of maps) {
    const d = m.data;

    metrics.totalFiles += d.metrics?.totalFiles || d.totalFiles || 0;
    metrics.totalDirs += d.metrics?.totalDirs || d.totalDirs || 0;
    metrics.totalSize += d.metrics?.totalSize || d.totalSize || 0;

    if (d.anomalies) metrics.anomalies.push(...d.anomalies);

    const extMap = d.byExtension || d.metrics?.byExtension || {};
    for (const [ext, info] of Object.entries(extMap)) {
      if (!metrics.extensions[ext]) metrics.extensions[ext] = { count: 0, size: 0 };
      metrics.extensions[ext].count += info.count || 0;
      metrics.extensions[ext].size += info.size || 0;
    }
  }

  return metrics;
}

// =========================
// SIGNATURE ENGINE
// =========================

function extractSignatures(maps) {
  const signatures = [];

  for (const m of maps) {
    if (m.data.signatures) {
      for (const s of m.data.signatures) {
        signatures.push({
          source: m.name,
          ...s,
        });
      }
    }
  }

  return signatures;
}

// =========================
// HEURISTIC ENGINE
// =========================

function computeHeuristics(metrics, signatures) {
  const heuristics = [];

  const totalFiles = metrics.totalFiles;
  const totalDirs = metrics.totalDirs;
  const anomaliesCount = metrics.anomalies.length;
  const extCount = Object.keys(metrics.extensions).length;

  if (totalFiles > 50000) {
    heuristics.push({
      id: "huge_file_count",
      category: "structure",
      label: "Très grand nombre de fichiers",
      severity: "high",
      details: { totalFiles },
    });
  }

  if (totalDirs > 3000) {
    heuristics.push({
      id: "deep_tree",
      category: "structure",
      label: "Arborescence très profonde ou fragmentée",
      severity: "medium",
      details: { totalDirs },
    });
  }

  if (extCount > 120) {
    heuristics.push({
      id: "high_extension_diversity",
      category: "coherence",
      label: "Diversité d'extensions très élevée",
      severity: "medium",
      details: { extCount },
    });
  }

  if (anomaliesCount > 50) {
    heuristics.push({
      id: "many_anomalies",
      category: "health",
      label: "Grand nombre d'anomalies détectées",
      severity: "high",
      details: { anomaliesCount },
    });
  }

  return heuristics;
}

// =========================
// CORRELATION ENGINE
// =========================

function computeCorrelations(metrics, signatures, heuristics) {
  const correlations = [];

  const isNode = signatures.some((s) => s.id === "node_project");
  const anomaliesCount = metrics.anomalies.length;

  if (isNode && anomaliesCount > 0) {
    correlations.push({
      id: "node_anomalies_correlation",
      label: "Corrélation entre projet Node.js et anomalies",
      severity: "medium",
      details: { anomaliesCount },
    });
  }

  const huge = heuristics.find((h) => h.id === "huge_file_count");
  const deep = heuristics.find((h) => h.id === "deep_tree");

  if (huge && deep) {
    correlations.push({
      id: "huge_and_deep_structure",
      label: "Structure volumineuse ET profonde",
      severity: "high",
      details: {
        files: huge.details.totalFiles,
        dirs: deep.details.totalDirs,
      },
    });
  }

  return correlations;
}

// =========================
// PREDICTION ENGINE
// =========================

function computePredictions(metrics, heuristics, correlations) {
  const predictions = [];

  if (heuristics.find((h) => h.id === "huge_file_count")) {
    predictions.push({
      id: "future_performance_risk",
      label: "Risque futur de lenteurs ou blocages",
      probability: "high",
      impact: "medium",
      details: "Volume de fichiers très élevé",
    });
  }

  if (correlations.find((c) => c.id === "huge_and_deep_structure")) {
    predictions.push({
      id: "future_fragmentation_risk",
      label: "Risque futur de fragmentation sévère",
      probability: "medium",
      impact: "high",
      details: "Structure volumineuse et profonde",
    });
  }

  return predictions;
}

// =========================
// ACTION ENGINE (Stability Action Graph)
// =========================

function computeActionGraph(metrics, heuristics, correlations, predictions) {
  const actions = {
    immediate: [],
    critical: [],
    preventive: [],
    optional: [],
  };

  if (metrics.anomalies.length > 0) {
    actions.immediate.push({
      id: "fix_anomalies",
      label: "Corriger les anomalies détectées",
      reason: "Anomalies présentes",
    });
  }

  if (heuristics.find((h) => h.id === "huge_file_count")) {
    actions.critical.push({
      id: "reduce_file_volume",
      label: "Réduire le volume de fichiers",
      reason: "Volume très élevé",
    });
  }

  if (correlations.find((c) => c.id === "huge_and_deep_structure")) {
    actions.critical.push({
      id: "restructure_tree",
      label: "Réorganiser l'arborescence",
      reason: "Structure volumineuse et profonde",
    });
  }

  if (predictions.find((p) => p.id === "future_performance_risk")) {
    actions.preventive.push({
      id: "optimize_performance",
      label: "Optimiser les performances",
      reason: "Risque futur de lenteurs",
    });
  }

  actions.optional.push({
    id: "cleanup_temp",
    label: "Nettoyer les fichiers temporaires",
    reason: "Bonne pratique générale",
  });

  return actions;
}

// =========================
// RISK MAP
// =========================

function computeRiskMap(metrics, heuristics, correlations, predictions) {
  return {
    anomalies: metrics.anomalies.length,
    heuristics: heuristics.length,
    correlations: correlations.length,
    predictions: predictions.length,
    riskLevel:
      metrics.anomalies.length > 50 ||
      heuristics.some((h) => h.severity === "high") ||
      correlations.some((c) => c.severity === "high")
        ? "critical"
        : "moderate",
  };
}

// =========================
// PLUGIN ENGINE
// =========================

function loadPlugins() {
  const pluginsDir = path.join(process.cwd(), "plugins", "stability");
  const plugins = [];

  if (!fs.existsSync(pluginsDir)) return plugins;

  const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;

    const full = path.join(pluginsDir, entry.name);
    try {
      const plugin = require(full);
      if (plugin && typeof plugin.run === "function") {
        plugins.push(plugin);
        logInfo(`Plugin stabilité chargé : ${plugin.name || entry.name}`);
      }
    } catch (e) {
      logError(`Erreur plugin ${entry.name} : ${e.message}`);
    }
  }

  return plugins;
}

function executePlugins(plugins, context) {
  const results = [];
  for (const p of plugins) {
    try {
      const out = p.run(context) || {};
      results.push({
        name: p.name || "plugin",
        version: p.version || "1.0.0",
        output: out,
      });
      logInfo(`Plugin exécuté : ${p.name}`);
    } catch (e) {
      logError(`Erreur exécution plugin ${p.name} : ${e.message}`);
    }
  }
  return results;
}

// =========================
// SCORING ENGINE
// =========================

function computeStabilityScore(metrics, heuristics, correlations, predictions, pluginResults) {
  let score = 100;
  const factors = [];

  const anomaliesCount = metrics.anomalies.length;
  if (anomaliesCount > 0) {
    const penalty = Math.min(40, anomaliesCount * 1.5);
    score -= penalty;
    factors.push({
      label: "Anomalies détectées",
      penalty,
      category: "health",
    });
  }

  for (const h of heuristics) {
    const penalty = h.severity === "high" ? 6 : 3;
    score -= penalty;
    factors.push({
      label: `Heuristique : ${h.label}`,
      penalty,
      category: h.category,
    });
  }

  for (const c of correlations) {
    const penalty = c.severity === "high" ? 5 : 3;
    score -= penalty;
    factors.push({
      label: `Corrélation : ${c.label}`,
      penalty,
      category: "correlation",
    });
  }

  for (const p of predictions) {
    const penalty = p.probability === "high" ? 5 : 2;
    score -= penalty;
    factors.push({
      label: `Prédiction : ${p.label}`,
      penalty,
      category: "prediction",
    });
  }

  for (const pr of pluginResults) {
    if (pr.output?.penalty?.value) {
      score -= pr.output.penalty.value;
      factors.push({
        label: `Plugin ${pr.name}`,
        penalty: pr.output.penalty.value,
        category: "plugin",
      });
    }
  }

  if (score < 0) score = 0;

  const rating =
    score >= 90
      ? "Excellent"
      : score >= 75
      ? "Bon"
      : score >= 60
      ? "Moyen"
      : score >= 40
      ? "Fragile"
      : "Critique";

  return { score, rating, factors };
}

// =========================
// RECOMMENDATIONS ENGINE
// =========================

function generateRecommendations(metrics, heuristics, correlations, predictions) {
  const recs = [];

  if (metrics.anomalies.length > 0) {
    recs.push("Corriger les anomalies détectées pour améliorer la stabilité globale.");
  }

  if (heuristics.find((h) => h.id === "huge_file_count")) {
    recs.push("Réduire le volume de fichiers pour éviter les lenteurs futures.");
  }

  if (correlations.find((c) => c.id === "huge_and_deep_structure")) {
    recs.push("Réorganiser l'arborescence pour réduire la fragmentation.");
  }

  if (predictions.find((p) => p.id === "future_performance_risk")) {
    recs.push("Optimiser les performances pour prévenir les risques futurs.");
  }

  if (recs.length === 0) {
    recs.push("Aucune recommandation critique. Le système semble stable.");
  }

  return recs;
}

// =========================
// REPORTING ENGINE
// =========================

function buildReport(target, maps, metrics, signatures, heuristics, correlations, predictions, actions, riskMap, pluginResults, stabilityScore) {
  return {
    meta: {
      product: PRODUCT.name,
      version: PRODUCT.version,
      engine: PRODUCT.engine,
      generatedAt: new Date().toISOString(),
    },
    context: {
      target,
      mapsUsed: maps.map((m) => m.name),
    },
    metrics,
    signatures,
    heuristics,
    correlations,
    predictions,
    actions,
    riskMap,
    stabilityScore,
    recommendations: generateRecommendations(metrics, heuristics, correlations, predictions),
    plugins: pluginResults,
  };
}

// =========================
// MAIN
// =========================

function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = args.path;
  const pluginsEnabled = args.plugins !== "off" && args.plugins !== "false";

  if (!target) {
    logError("Usage: MetaStabilizer_VX.exe --path=C:\\Projet");
    process.exit(1);
  }

  logInfo(`=== ${PRODUCT.name} v${PRODUCT.version} (${PRODUCT.engine}) ===`);
  logInfo(`Dossier cible : ${target}`);
  logInfo(`Plugins : ${pluginsEnabled ? "activés" : "désactivés"}`);

  const maps = loadAllMaps();
  if (maps.length === 0) {
    logError("Aucune map trouvée. Lancer NexusInspector d'abord.");
    process.exit(1);
  }

  logInfo("Fusion des maps...");
  const metrics = computeCoreMetrics(maps);

  logInfo("Extraction des signatures...");
  const signatures = extractSignatures(maps);

  logInfo("Analyse heuristique...");
  const heuristics = computeHeuristics(metrics, signatures);

  logInfo("Analyse des corrélations...");
  const correlations = computeCorrelations(metrics, signatures, heuristics);

  logInfo("Prédictions...");
  const predictions = computePredictions(metrics, heuristics, correlations);

  logInfo("Génération du Stability Action Graph...");
  const actions = computeActionGraph(metrics, heuristics, correlations, predictions);

  logInfo("Construction de la Risk Map...");
  const riskMap = computeRiskMap(metrics, heuristics, correlations, predictions);

  let pluginResults = [];
  if (pluginsEnabled) {
    logInfo("Chargement des plugins de stabilité...");
    const plugins = loadPlugins();
    const context = { target, maps, metrics, signatures, heuristics, correlations, predictions };
    pluginResults = executePlugins(plugins, context);
  }

  logInfo("Calcul du Stability Score...");
  const stabilityScore = computeStabilityScore(metrics, heuristics, correlations, predictions, pluginResults);

  logInfo("Construction du rapport civilisationnel...");
  const report = buildReport(
    target,
    maps,
    metrics,
    signatures,
    heuristics,
    correlations,
    predictions,
    actions,
    riskMap,
    pluginResults,
    stabilityScore
  );

  const logsDir = ensureLogsDir();
  const outFile = path.join(logsDir, "meta_stability_map.json");
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), "utf8");
}
