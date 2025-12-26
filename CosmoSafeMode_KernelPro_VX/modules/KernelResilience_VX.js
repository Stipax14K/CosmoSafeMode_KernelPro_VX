// KernelResilience_VX.js
// CosmoSafeMode Kernel Pro - KernelResilience VX
// v3.0 - Resilience Civilization Engine
//
// RÔLE :
// - Journaliser chaque run du pipeline VX (phases, statuts, métadonnées)
// - Maintenir un historique principal + archives détaillées
// - Analyser les patterns de résilience (succès, échecs, répétitions, séquences)
// - Calculer un Resilience Score + facteurs + tendances
// - Générer un Resilience Action Graph (actions immédiates, critiques, préventives, optionnelles, premium)
// - Générer une Resilience Risk Map
// - Charger des plugins de résilience (/plugins/resilience)
// - Générer un rapport JSON civilisationnel (kernel_resilience_map.json)
// - Servir de cerveau historique pour NexusInspector, MetaStabilizer, SelfRepair, RecoveryKernel, Orchestrator
//
// Usage :
//   KernelResilience_VX.exe --phase="NexusInspector" --status=success --runId=123
//   KernelResilience_VX.exe --phase="SelfRepair" --status=error --runId=123 --note="Erreur IO"
//   KernelResilience_VX.exe --phase="PipelineFull" --status=success --runId=123 --mode=final
//
// Remarque :
// - Chaque exécution ajoute une entrée au kernel_history.json (résumé) + une archive détaillée dans /logs/kernel_history/

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
  name: "KernelResilience VX",
  version: "3.0.0",
  engine: "Resilience Civilization Engine",
};

const FILES = {
  historyMain: "kernel_history.json",
  resilienceMap: "kernel_resilience_map.json",
  historyArchiveDir: "kernel_history",
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
  const logFile = path.join(logsDir, "kernelresilience_vx.log");
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
    if (k && k.startsWith("--")) {
      result[k.slice(2)] = v === undefined ? true : v;
    }
  });
  return result;
}

// =========================
// HISTORY CORE ENGINE
// =========================

function ensureHistoryArchiveDir() {
  const logsDir = ensureLogsDir();
  const archiveDir = path.join(logsDir, FILES.historyArchiveDir);
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
  return archiveDir;
}

function loadMainHistory() {
  const logsDir = ensureLogsDir();
  const historyFile = path.join(logsDir, FILES.historyMain);
  if (!fs.existsSync(historyFile)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(historyFile, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (e) {
    logWarn("Erreur lecture kernel_history.json, réinitialisation de l'historique principal : " + e.message);
    return [];
  }
}

function saveMainHistory(history) {
  const logsDir = ensureLogsDir();
  const historyFile = path.join(logsDir, FILES.historyMain);
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), "utf8");
}

function createRunEntry(args) {
  const now = new Date().toISOString();
  return {
    id: args.runId || `run_${Date.now()}`,
    phase: args.phase || "unknown",
    status: args.status || "unknown",
    mode: args.mode || null,
    note: args.note || null,
    meta: {
      source: "KernelResilience VX",
      version: PRODUCT.version,
    },
    at: now,
  };
}

function saveArchiveEntry(entry, historySnapshot) {
  const logsDir = ensureLogsDir();
  const archiveDir = ensureHistoryArchiveDir();

  const ts = entry.at.replace(/[:.]/g, "").replace("T", "_").replace("Z", "");
  const safePhase = String(entry.phase || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `kernel_history_${safePhase}_${ts}.json`;
  const fullPath = path.join(archiveDir, fileName);

  const archivePayload = {
    meta: {
      product: PRODUCT.name,
      version: PRODUCT.version,
      engine: PRODUCT.engine,
      archivedAt: new Date().toISOString(),
    },
    latestEntry: entry,
    historySnapshot,
  };

  fs.writeFileSync(fullPath, JSON.stringify(archivePayload, null, 2), "utf8");
  logInfo(`Archive écrite : ${fullPath}`);
}

// =========================
// RESILIENCE ANALYTICS
// =========================

function computeCoreMetrics(history) {
  const totalRuns = history.length;
  let successCount = 0;
  let errorCount = 0;
  let unknownCount = 0;

  const phaseStats = {};
  const statusStats = {};

  for (const h of history) {
    const status = (h.status || "unknown").toLowerCase();
    if (status === "success") successCount++;
    else if (status === "error" || status === "fail" || status === "failure") errorCount++;
    else unknownCount++;

    const phase = h.phase || "unknown";
    if (!phaseStats[phase]) {
      phaseStats[phase] = { total: 0, success: 0, error: 0, unknown: 0 };
    }
    phaseStats[phase].total++;
    if (status === "success") phaseStats[phase].success++;
    else if (status === "error" || status === "fail" || status === "failure") phaseStats[phase].error++;
    else phaseStats[phase].unknown++;

    if (!statusStats[status]) statusStats[status] = 0;
    statusStats[status]++;
  }

  return {
    totalRuns,
    successCount,
    errorCount,
    unknownCount,
    phaseStats,
    statusStats,
  };
}

function computePatterns(history, metrics) {
  const patterns = {
    repeatedFailures: [],
    repeatedSuccesses: [],
    phaseSequences: [],
  };

  // Phases avec beaucoup d'échecs
  for (const [phase, stat] of Object.entries(metrics.phaseStats)) {
    if (stat.error >= 3 && stat.error > stat.success) {
      patterns.repeatedFailures.push({
        phase,
        error: stat.error,
        success: stat.success,
        total: stat.total,
      });
    }
    if (stat.success >= 5 && stat.success > stat.error) {
      patterns.repeatedSuccesses.push({
        phase,
        error: stat.error,
        success: stat.success,
        total: stat.total,
      });
    }
  }

  // Séquences successives de phases (pattern simple)
  const seqWindow = 3;
  for (let i = 0; i < history.length - seqWindow + 1; i++) {
    const slice = history.slice(i, i + seqWindow);
    const phases = slice.map((r) => r.phase || "unknown");
    patterns.phaseSequences.push({
      phases,
      startAt: slice[0].at,
      endAt: slice[slice.length - 1].at,
    });
  }

  return patterns;
}

function computeCorrelations(metrics, patterns) {
  const correlations = [];

  if (metrics.errorCount > 0 && metrics.successCount > 0) {
    correlations.push({
      id: "mixed_outcomes",
      label: "Mélange de succès et d'échecs dans l'historique",
      severity: "medium",
    });
  }

  if (patterns.repeatedFailures.length > 0) {
    correlations.push({
      id: "repeated_phase_failures",
      label: "Phases avec échecs répétés",
      severity: "high",
      details: patterns.repeatedFailures,
    });
  }

  if (patterns.repeatedSuccesses.length > 0) {
    correlations.push({
      id: "stable_phases",
      label: "Phases stables avec nombreux succès",
      severity: "low",
      details: patterns.repeatedSuccesses,
    });
  }

  return correlations;
}

function computePredictions(metrics, patterns, correlations) {
  const predictions = [];

  if (metrics.errorCount > 0 && metrics.errorCount >= metrics.successCount) {
    predictions.push({
      id: "future_instability_risk",
      label: "Risque futur de pipeline instable",
      probability: "high",
      impact: "high",
    });
  }

  if (patterns.repeatedFailures.length > 0) {
    predictions.push({
      id: "phase_specific_risk",
      label: "Risque concentré sur certaines phases",
      probability: "medium",
      impact: "high",
      details: patterns.repeatedFailures.map((p) => p.phase),
    });
  }

  if (correlations.find((c) => c.id === "stable_phases")) {
    predictions.push({
      id: "stable_segments",
      label: "Segments stables du pipeline identifiés",
      probability: "high",
      impact: "medium",
    });
  }

  return predictions;
}

// =========================
// RESILIENCE SCORE ENGINE
// =========================

function computeResilienceScore(metrics, correlations, predictions) {
  let score = 100;
  const factors = [];

  const { totalRuns, successCount, errorCount } = metrics;

  if (totalRuns === 0) {
    return {
      score: 50,
      rating: "Inconnu",
      factors: [{ label: "Aucun run enregistré", impact: "neutral" }],
    };
  }

  const successRatio = successCount / totalRuns;
  const errorRatio = errorCount / Math.max(1, totalRuns);

  // Pénalités sur erreurs
  const errorPenalty = Math.round(errorRatio * 40);
  if (errorPenalty > 0) {
    score -= errorPenalty;
    factors.push({
      label: "Taux d'erreur global",
      penalty: errorPenalty,
      detail: `${errorCount}/${totalRuns} runs en erreur`,
    });
  }

  // Bonus sur succès
  const successBonus = Math.round(successRatio * 20);
  score += successBonus;
  factors.push({
    label: "Taux de succès global",
    bonus: successBonus,
    detail: `${successCount}/${totalRuns} runs en succès`,
  });

  // Corrélations (échecs répétés)
  if (correlations.find((c) => c.id === "repeated_phase_failures")) {
    const penalty = 15;
    score -= penalty;
    factors.push({
      label: "Échecs répétés sur certaines phases",
      penalty,
    });
  }

  // Prédictions
  for (const p of predictions) {
    if (p.id === "future_instability_risk") {
      const penalty = 20;
      score -= penalty;
      factors.push({
        label: "Risque futur d'instabilité du pipeline",
        penalty,
      });
    }
    if (p.id === "phase_specific_risk") {
      const penalty = 10;
      score -= penalty;
      factors.push({
        label: "Risque concentré sur certaines phases",
        penalty,
      });
    }
  }

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  let rating = "Excellent";
  if (score < 90) rating = "Bon";
  if (score < 75) rating = "Moyen";
  if (score < 60) rating = "Fragile";
  if (score < 40) rating = "Critique";

  return {
    score,
    rating,
    factors,
  };
}

// =========================
// ACTION ENGINE (Resilience Action Graph)
// =========================

function computeActionGraph(metrics, patterns, correlations, predictions) {
  const actions = {
    immediate: [],
    critical: [],
    preventive: [],
    optional: [],
    premium: [],
  };

  if (metrics.errorCount > 0) {
    actions.immediate.push({
      id: "review_last_errors",
      label: "Analyser les derniers runs en erreur",
      reason: "Présence de runs en échec",
    });
  }

  if (patterns.repeatedFailures.length > 0) {
    actions.critical.push({
      id: "stabilize_failing_phases",
      label: "Stabiliser les phases avec échecs répétés",
      reason: "Patterns d'échecs sur certaines phases",
      phases: patterns.repeatedFailures.map((p) => p.phase),
    });
  }

  if (predictions.find((p) => p.id === "future_instability_risk")) {
    actions.critical.push({
      id: "audit_full_pipeline",
      label: "Auditer le pipeline complet",
      reason: "Risque d'instabilité globale",
    });
  }

  if (patterns.repeatedSuccesses.length > 0) {
    actions.preventive.push({
      id: "document_stable_segments",
      label: "Documenter les segments stables",
      reason: "Capitaliser sur les phases stables",
      phases: patterns.repeatedSuccesses.map((p) => p.phase),
    });
  }

  actions.optional.push({
    id: "snapshot_current_state",
    label: "Prendre un snapshot de l'état actuel",
    reason: "Bonne pratique de résilience",
  });

  if (predictions.find((p) => p.id === "stable_segments")) {
    actions.premium.push({
      id: "build_resilience_patterns_library",
      label: "Construire une bibliothèque de patterns de résilience",
      reason: "Préparation à un futur SaaS / IA",
    });
  }

  return actions;
}

// =========================
// RISK MAP
// =========================

function computeRiskMap(metrics, patterns, correlations, predictions) {
  const riskLevel =
    metrics.errorCount === 0 && patterns.repeatedFailures.length === 0
      ? "low"
      : correlations.some((c) => c.severity === "high") ||
        predictions.some((p) => p.probability === "high")
      ? "critical"
      : "moderate";

  return {
    totalRuns: metrics.totalRuns,
    errors: metrics.errorCount,
    successes: metrics.successCount,
    repeatedFailurePhases: patterns.repeatedFailures.map((p) => p.phase),
    repeatedSuccessPhases: patterns.repeatedSuccesses.map((p) => p.phase),
    correlationsCount: correlations.length,
    predictionsCount: predictions.length,
    riskLevel,
  };
}

// =========================
// PLUGIN ENGINE
// =========================

function loadPlugins() {
  const pluginsDir = path.join(process.cwd(), "plugins", "resilience");
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
        logInfo(`Plugin résilience chargé : ${plugin.name || entry.name}`);
      } else {
        logWarn(`Plugin ignoré (pas de run) : ${entry.name}`);
      }
    } catch (e) {
      logError(`Erreur chargement plugin ${entry.name} : ${e.message}`);
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
      logInfo(`Plugin exécuté : ${p.name || "plugin"}`);
    } catch (e) {
      logError(`Erreur exécution plugin ${p.name || "plugin"} : ${e.message}`);
    }
  }
  return results;
}

// =========================
// RECOMMENDATIONS ENGINE
// =========================

function generateRecommendations(metrics, patterns, correlations, predictions) {
  const recs = [];

  if (metrics.errorCount > 0) {
    recs.push("Analyser en priorité les runs en erreur et les phases associées.");
  }
  if (patterns.repeatedFailures.length > 0) {
    recs.push("Mettre en place un plan de stabilisation ciblé sur les phases en échec répété.");
  }
  if (patterns.repeatedSuccesses.length > 0) {
    recs.push("Documenter les phases stables comme référence de résilience.");
  }
  if (predictions.find((p) => p.id === "future_instability_risk")) {
    recs.push("Prévoir des audits réguliers du pipeline pour réduire le risque d'instabilité.");
  }
  if (recs.length === 0) {
    recs.push("Aucun signal critique : la résilience du pipeline semble satisfaisante pour le moment.");
  }

  return recs;
}

// =========================
// REPORTING ENGINE
// =========================

function buildResilienceReport(history, metrics, patterns, correlations, predictions, resilienceScore, actions, riskMap, pluginResults) {
  return {
    meta: {
      product: PRODUCT.name,
      version: PRODUCT.version,
      engine: PRODUCT.engine,
      generatedAt: new Date().toISOString(),
    },
    history: {
      totalRuns: metrics.totalRuns,
      successCount: metrics.successCount,
      errorCount: metrics.errorCount,
      unknownCount: metrics.unknownCount,
      phaseStats: metrics.phaseStats,
      statusStats: metrics.statusStats,
      lastRuns: history.slice(-20), // derniers runs pour vue rapide
    },
    analytics: {
      patterns,
      correlations,
      predictions,
      resilienceScore,
      riskMap,
      actions,
    },
    recommendations: generateRecommendations(metrics, patterns, correlations, predictions),
    plugins: pluginResults,
  };
}

// =========================
// MAIN
// =========================

function main() {
  const args = parseArgs(process.argv.slice(2));

  const phase = args.phase || "unknown";
  const status = args.status || "unknown";

  logInfo(`=== ${PRODUCT.name} v${PRODUCT.version} (${PRODUCT.engine}) ===`);
  logInfo(`Phase : ${phase}`);
  logInfo(`Status : ${status}`);

  // 1. Charger l'historique principal
  const history = loadMainHistory();

  // 2. Créer et ajouter une nouvelle entrée
  const entry = createRunEntry(args);
  history.push(entry);
  saveMainHistory(history);
  logInfo("Entrée ajoutée dans kernel_history.json");

  // 3. Créer une archive avec snapshot
  saveArchiveEntry(entry, history);

  // 4. Analytics civilisationnels
  logInfo("Calcul des métriques de résilience...");
  const metrics = computeCoreMetrics(history);

  logInfo("Détection des patterns...");
  const patterns = computePatterns(history, metrics);

  logInfo("Analyse des corrélations...");
  const correlations = computeCorrelations(metrics, patterns);

  logInfo("Prédictions de résilience...");
  const predictions = computePredictions(metrics, patterns, correlations);

  logInfo("Calcul du Resilience Score...");
  const resilienceScore = computeResilienceScore(metrics, correlations, predictions);

  logInfo("Construction du Resilience Action Graph...");
  const actions = computeActionGraph(metrics, patterns, correlations, predictions);

  logInfo("Construction de la Resilience Risk Map...");
  const riskMap = computeRiskMap(metrics, patterns, correlations, predictions);

  // 5. Plugins
  let pluginResults = [];
  if (args.plugins !== "off" && args.plugins !== "false") {
    logInfo("Chargement des plugins de résilience...");
    const plugins = loadPlugins();
    if (plugins.length > 0) {
      const context = {
        history,
        metrics,
        patterns,
        correlations,
        predictions,
        resilienceScore,
        actions,
        riskMap,
      };
      pluginResults = executePlugins(plugins, context);
    } else {
      logInfo("Aucun plugin de résilience détecté.");
    }
  } else {
    logInfo("Plugins de résilience désactivés par paramètres.");
  }

  // 6. Rapport civilisationnel
  logInfo("Construction du rapport de résilience civilisationnel...");
  const report = buildResilienceReport(
    history,
    metrics,
    patterns,
    correlations,
    predictions,
    resilienceScore,
    actions,
    riskMap,
    pluginResults
  );

  const logsDir = ensureLogsDir();
  const resilienceMapFile = path.join(logsDir, FILES.resilienceMap);
  fs.writeFileSync(resilienceMapFile, JSON.stringify(report, null, 2), "utf8");

  logInfo(`Rapport de résilience généré : ${resilienceMapFile}`);
  logInfo(`Resilience Score : ${resilienceScore.score}/100 (${resilienceScore.rating})`);
  logInfo(`${PRODUCT.name} v${PRODUCT.version} terminé.`);
  process.exit(0);
}

main();
