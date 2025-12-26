// RecoveryKernel_VX.js
// CosmoSafeMode Kernel Pro - RecoveryKernel VX
// v3.0 - Recovery Civilization Engine
//
// RÔLE :
// - Lire les rapports JSON :
//     nexus_map.json
//     meta_stability_map.json
//     selfrepair_map.json
//     kernel_resilience_map.json
//     orchestrator_map.json
// - Détecter les situations de rupture et signaux critiques
// - Analyser les patterns de défaillance et d’instabilité
// - Calculer un Recovery Score + facteurs
// - Générer un Recovery Action Graph (immédiate / critique / préventive / optionnelle / premium)
// - Générer une Recovery Risk Map
// - Charger des plugins de récupération (/plugins/recovery)
// - Générer un rapport JSON civilisationnel : recovery_map.json
// - Notifier KernelResilience d’une phase “recovery” avec runId
//
// Usage :
//   RecoveryKernel_VX.exe --path="C:\\CosmoCodeUniverse" --runId=orchestrator_XXXXXXXX
//
// Remarque :
// - Peut être lancé après CosmoOrchestrator_VX, ou en stand‑alone.

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
const { spawn } = require("child_process");

// =========================
// CONFIG PRODUIT
// =========================

const PRODUCT = {
  name: "RecoveryKernel VX",
  version: "3.0.0",
  engine: "Recovery Civilization Engine",
};

const FILES = {
  nexusMap: "nexus_map.json",
  stabilityMap: "meta_stability_map.json",
  selfRepairMap: "selfrepair_map.json",
  resilienceMap: "kernel_resilience_map.json",
  orchestratorMap: "orchestrator_map.json",
  recoveryMap: "recovery_map.json",
};

// =========================
/* LOGGING PREMIUM */
// =========================

function ensureLogsDir() {
  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  return logsDir;
}

function log(level, msg) {
  const logsDir = ensureLogsDir();
  const logFile = path.join(logsDir, "recoverykernel_vx.log");
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
/* ARGUMENTS */
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
/* JSON LOADER */
// =========================

function safeReadJson(fileName) {
  const logsDir = ensureLogsDir();
  const full = path.join(logsDir, fileName);
  if (!fs.existsSync(full)) return null;
  try {
    const raw = fs.readFileSync(full, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    logWarn(`Erreur lecture JSON (${fileName}) : ${e.message}`);
    return null;
  }
}

// =========================
/* KERNEL RESILIENCE HOOK */
// =========================

function runKernelResilience(phase, status, runId) {
  return new Promise((resolve) => {
    const args = [`--phase=${phase}`, `--status=${status}`, `--runId=${runId || `recovery_${Date.now()}`}`];
    logInfo(`→ [kernel-resilience] KernelResilience_VX.exe ${args.join(" ")}`);
    const child = spawn("KernelResilience_VX.exe", args, { stdio: "inherit" });

    child.on("exit", (code) => {
      logInfo(`← [kernel-resilience] Fin KernelResilience_VX.exe (code=${code})`);
      resolve(code);
    });
  });
}

// =========================
/* RECOVERY ANALYTICS ENGINE */
// =========================

function computeRecoverySignals(nexus, stability, selfrepair, resilience, orchestrator) {
  const signals = {
    structuralIssues: [],
    stabilityIssues: [],
    repairIssues: [],
    orchestrationIssues: [],
    resilienceWeaknesses: [],
  };

  // Structural
  if (nexus && nexus.globalScore) {
    if (nexus.globalScore.rating === "Fragile" || nexus.globalScore.rating === "Critique") {
      signals.structuralIssues.push({
        id: "low_structural_score",
        label: "Score structurel faible",
        details: nexus.globalScore,
      });
    }
  }

  // Stability
  if (stability) {
    const riskLevel = stability.riskMap?.riskLevel;
    if (riskLevel === "critical" || (stability.stabilityScore && stability.stabilityScore.score < 60)) {
      signals.stabilityIssues.push({
        id: "high_stability_risk",
        label: "Risque de stabilité élevé",
        details: {
          riskLevel,
          score: stability.stabilityScore?.score,
        },
      });
    }
  }

  // SelfRepair
  if (selfrepair) {
    if (selfrepair.riskMap?.riskLevel === "critical") {
      signals.repairIssues.push({
        id: "critical_repair_signals",
        label: "Signaux de réparation critiques",
        details: {
          issues: selfrepair.issues?.length || 0,
        },
      });
    }
  }

  // Orchestrator
  if (orchestrator) {
    const hadErrors = orchestrator.pipeline?.phases?.some((p) => p.status === "error");
    if (hadErrors) {
      signals.orchestrationIssues.push({
        id: "pipeline_phase_errors",
        label: "Des phases du pipeline ont échoué",
      });
    }
  }

  // Resilience
  if (resilience && resilience.analytics?.resilienceScore) {
    const rScore = resilience.analytics.resilienceScore;
    if (rScore.score < 60) {
      signals.resilienceWeaknesses.push({
        id: "fragile_resilience",
        label: "Résilience du pipeline fragile",
        details: rScore,
      });
    }
  }

  return signals;
}

function computeFailurePatterns(signals, resilience) {
  const patterns = {
    multiDimensionalFailure: false,
    repeatedPipelineIssues: false,
    repairLoopRisk: false,
    notes: [],
  };

  const structural = signals.structuralIssues.length > 0;
  const stability = signals.stabilityIssues.length > 0;
  const repair = signals.repairIssues.length > 0;
  const orchestration = signals.orchestrationIssues.length > 0;
  const resilienceWeak = signals.resilienceWeaknesses.length > 0;

  const dimensions = [structural, stability, repair, orchestration, resilienceWeak].filter(Boolean).length;

  if (dimensions >= 3) {
    patterns.multiDimensionalFailure = true;
    patterns.notes.push("Défaillances détectées sur plusieurs dimensions (structure, stabilité, réparation, orchestration, résilience).");
  }

  if (resilience && resilience.analytics?.patterns?.repeatedFailures?.length > 0) {
    patterns.repeatedPipelineIssues = true;
    patterns.notes.push("Phases avec échecs répétés détectées dans l'historique de résilience.");
  }

  if (repair && orchestration) {
    patterns.repairLoopRisk = true;
    patterns.notes.push("Risque de boucle de réparation (échecs + signaux critiques).");
  }

  return patterns;
}

function computeRecoveryCorrelations(signals, patterns) {
  const correlations = [];

  if (patterns.multiDimensionalFailure) {
    correlations.push({
      id: "multi_dimensional_failure_correlation",
      label: "Corrélation de défaillances multi‑dimensionnelles",
      severity: "high",
    });
  }

  if (patterns.repeatedPipelineIssues) {
    correlations.push({
      id: "repeated_pipeline_failure_correlation",
      label: "Corrélation d'échecs répétés du pipeline",
      severity: "high",
    });
  }

  if (patterns.repairLoopRisk) {
    correlations.push({
      id: "repair_loop_risk_correlation",
      label: "Corrélation indiquant un risque de boucle de réparation",
      severity: "medium",
    });
  }

  if (
    signals.structuralIssues.length > 0 &&
    signals.stabilityIssues.length > 0
  ) {
    correlations.push({
      id: "structure_stability_link",
      label: "Lien probable entre problèmes structurels et instabilité",
      severity: "medium",
    });
  }

  return correlations;
}

function computeRecoveryPredictions(signals, patterns, correlations) {
  const predictions = [];

  if (patterns.multiDimensionalFailure) {
    predictions.push({
      id: "high_recovery_complexity",
      label: "Complexité de récupération élevée",
      probability: "high",
      impact: "high",
    });
  }

  if (patterns.repairLoopRisk) {
    predictions.push({
      id: "risk_of_repair_loop",
      label: "Risque de boucle de réparation si non stabilisé",
      probability: "medium",
      impact: "high",
    });
  }

  if (correlations.some((c) => c.id === "structure_stability_link")) {
    predictions.push({
      id: "need_structural_refactor",
      label: "Risque de devoir refactorer des parties structurelles pour stabiliser",
      probability: "medium",
      impact: "medium",
    });
  }

  if (
    signals.resilienceWeaknesses.length > 0 &&
    signals.orchestrationIssues.length > 0
  ) {
    predictions.push({
      id: "future_pipeline_instability",
      label: "Risque futur de pipeline instable sans plan de récupération",
      probability: "high",
      impact: "high",
    });
  }

  return predictions;
}

// =========================
/* RECOVERY SCORE ENGINE */
// =========================

function computeRecoveryScore(signals, patterns, correlations, predictions) {
  let score = 100;
  const factors = [];

  const dimCount =
    (signals.structuralIssues.length > 0 ? 1 : 0) +
    (signals.stabilityIssues.length > 0 ? 1 : 0) +
    (signals.repairIssues.length > 0 ? 1 : 0) +
    (signals.orchestrationIssues.length > 0 ? 1 : 0) +
    (signals.resilienceWeaknesses.length > 0 ? 1 : 0);

  if (dimCount >= 3) {
    const penalty = 25;
    score -= penalty;
    factors.push({
      label: "Défaillances sur plusieurs dimensions",
      penalty,
    });
  }

  if (patterns.multiDimensionalFailure) {
    const penalty = 15;
    score -= penalty;
    factors.push({
      label: "Pattern de défaillance multi‑dimensionnelle",
      penalty,
    });
  }

  if (patterns.repairLoopRisk) {
    const penalty = 10;
    score -= penalty;
    factors.push({
      label: "Risque de boucle de réparation",
      penalty,
    });
  }

  for (const p of predictions) {
    if (p.id === "high_recovery_complexity") {
      const penalty = 15;
      score -= penalty;
      factors.push({
        label: "Complexité de récupération élevée",
        penalty,
      });
    }
    if (p.id === "future_pipeline_instability") {
      const penalty = 20;
      score -= penalty;
      factors.push({
        label: "Risque futur d'instabilité du pipeline",
        penalty,
      });
    }
  }

  if (score < 0) score = 0;
  if (score > 100) score = 100;

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
/* RECOVERY ACTION ENGINE */
// =========================

function buildRecoveryActionGraph(signals, patterns, correlations, predictions) {
  const actions = {
    immediate: [],
    critical: [],
    preventive: [],
    optional: [],
    premium: [],
  };

  if (signals.orchestrationIssues.length > 0) {
    actions.immediate.push({
      id: "review_failed_phases",
      label: "Analyser les phases du pipeline en échec",
      reason: "Présence de phases en erreur dans l'orchestrateur",
    });
  }

  if (signals.repairIssues.length > 0) {
    actions.critical.push({
      id: "perform_controlled_repair",
      label: "Lancer une réparation contrôlée (mode safe)",
      reason: "Signaux de réparation critiques",
    });
  }

  if (signals.stabilityIssues.length > 0) {
    actions.critical.push({
      id: "apply_stability_recommendations",
      label: "Appliquer les recommandations de MetaStabilizer",
      reason: "Risque de stabilité élevé",
    });
  }

  if (signals.structuralIssues.length > 0) {
    actions.preventive.push({
      id: "plan_structural_refactor",
      label: "Planifier un refactor structurel partiel",
      reason: "Score structurel faible",
    });
  }

  if (patterns.repairLoopRisk) {
    actions.critical.push({
      id: "break_repair_loop",
      label: "Mettre en place des garde‑fous pour éviter une boucle de réparation",
      reason: "Risque de boucle de réparation détecté",
    });
  }

  actions.optional.push({
    id: "snapshot_before_next_runs",
    label: "Prendre un snapshot de l'univers avant de nouveaux runs",
    reason: "Bonne pratique de récupération",
  });

  if (predictions.some((p) => p.id === "high_recovery_complexity")) {
    actions.premium.push({
      id: "design_recovery_playbook",
      label: "Concevoir un playbook de récupération multi‑scénarios",
      reason: "Complexité de récupération élevée",
    });
  }

  if (predictions.some((p) => p.id === "future_pipeline_instability")) {
    actions.premium.push({
      id: "implement_resilience_scenarios",
      label: "Implémenter des scénarios de résilience avancés (relances, modes safe, rollback)",
      reason: "Risque futur d'instabilité du pipeline",
    });
  }

  return actions;
}

// =========================
/* RECOVERY RISK MAP */
// =========================

function computeRecoveryRiskMap(signals, patterns, correlations, predictions, recoveryScore) {
  const dimCount =
    (signals.structuralIssues.length > 0 ? 1 : 0) +
    (signals.stabilityIssues.length > 0 ? 1 : 0) +
    (signals.repairIssues.length > 0 ? 1 : 0) +
    (signals.orchestrationIssues.length > 0 ? 1 : 0) +
    (signals.resilienceWeaknesses.length > 0 ? 1 : 0);

  let level = "low";

  if (
    dimCount >= 3 ||
    patterns.multiDimensionalFailure ||
    predictions.some((p) => p.impact === "high" && p.probability === "high") ||
    recoveryScore.score < 50
  ) {
    level = "critical";
  } else if (dimCount >= 2 || recoveryScore.score < 75) {
    level = "moderate";
  }

  return {
    dimensionsAffected: dimCount,
    multiDimensionalFailure: patterns.multiDimensionalFailure,
    repairLoopRisk: patterns.repairLoopRisk,
    correlationsCount: correlations.length,
    predictionsCount: predictions.length,
    recoveryScore: recoveryScore.score,
    recoveryRating: recoveryScore.rating,
    riskLevel: level,
  };
}

// =========================
/* PLUGIN ENGINE */
// =========================

function loadPlugins() {
  const pluginsDir = path.join(process.cwd(), "plugins", "recovery");
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
        logInfo(`Plugin recovery chargé : ${plugin.name || entry.name}`);
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
/* RECOMMENDATIONS ENGINE */
// =========================

function generateRecommendations(signals, patterns, correlations, predictions) {
  const recs = [];

  if (signals.orchestrationIssues.length > 0) {
    recs.push("Analyser les erreurs de pipeline et les phases concernées avant toute nouvelle exécution.");
  }

  if (signals.repairIssues.length > 0) {
    recs.push("Appliquer un SelfRepair en mode safe après sauvegarde, en suivant le plan recommandé.");
  }

  if (signals.stabilityIssues.length > 0) {
    recs.push("Traiter les recommandations de MetaStabilizer pour réduire le risque de rupture.");
  }

  if (signals.structuralIssues.length > 0) {
    recs.push("Planifier un refactor structurel ciblé sur les zones les plus fragiles.");
  }

  if (patterns.repairLoopRisk) {
    recs.push("Mettre en place des garde‑fous pour éviter de re‑lancer en boucle des séquences instables.");
  }

  if (predictions.some((p) => p.id === "future_pipeline_instability")) {
    recs.push("Créer des scénarios de récupération standardisés pour les futures instabilités du pipeline.");
  }

  if (recs.length === 0) {
    recs.push("Aucun signal de récupération critique détecté. La situation est sous contrôle.");
  }

  return recs;
}

// =========================
/* REPORTING ENGINE */
// =========================

function buildRecoveryReport(target, runId, signals, patterns, correlations, predictions, recoveryScore, actions, riskMap, pluginResults) {
  return {
    meta: {
      product: PRODUCT.name,
      version: PRODUCT.version,
      engine: PRODUCT.engine,
      generatedAt: new Date().toISOString(),
      runId,
    },
    context: {
      target,
    },
    signals,
    patterns,
    correlations,
    predictions,
    recoveryScore,
    actions,
    riskMap,
    plugins: pluginResults,
    recommendations: generateRecommendations(signals, patterns, correlations, predictions),
  };
}

// =========================
/* MAIN */
// =========================

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = args.path || process.cwd();
  const runId = args.runId || `recovery_${Date.now()}`;
  const pluginsEnabled = args.plugins !== "off" && args.plugins !== "false";

  logInfo(`=== ${PRODUCT.name} v${PRODUCT.version} (${PRODUCT.engine}) ===`);
  logInfo(`Target : ${target}`);
  logInfo(`RunId : ${runId}`);
  logInfo(`Plugins : ${pluginsEnabled ? "activés" : "désactivés"}`);

  await runKernelResilience("recovery_start", "running", runId);

  const nexus = safeReadJson(FILES.nexusMap);
  const stability = safeReadJson(FILES.stabilityMap);
  const selfrepair = safeReadJson(FILES.selfRepairMap);
  const resilience = safeReadJson(FILES.resilienceMap);
  const orchestrator = safeReadJson(FILES.orchestratorMap);

  const signals = computeRecoverySignals(nexus, stability, selfrepair, resilience, orchestrator);
  const patterns = computeFailurePatterns(signals, resilience);
  const correlations = computeRecoveryCorrelations(signals, patterns);
  const predictions = computeRecoveryPredictions(signals, patterns, correlations);
  const recoveryScore = computeRecoveryScore(signals, patterns, correlations, predictions);
  const actions = buildRecoveryActionGraph(signals, patterns, correlations, predictions);
  const riskMap = computeRecoveryRiskMap(signals, patterns, correlations, predictions, recoveryScore);

  let pluginResults = [];
  if (pluginsEnabled) {
    const plugins = loadPlugins();
    if (plugins.length > 0) {
      const context = {
        target,
        nexus,
        stability,
        selfrepair,
        resilience,
        orchestrator,
        signals,
        patterns,
        correlations,
        predictions,
        recoveryScore,
        actions,
        riskMap,
        runId,
      };
      pluginResults = executePlugins(plugins, context);
    } else {
      logInfo("Aucun plugin de récupération détecté.");
    }
  }

  const report = buildRecoveryReport(
    target,
    runId,
    signals,
    patterns,
    correlations,
    predictions,
    recoveryScore,
    actions,
    riskMap,
    pluginResults
  );

  const logsDir = ensureLogsDir();
  const outFile = path.join(logsDir, FILES.recoveryMap);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), "utf8");

  logInfo(`Recovery map générée : ${outFile}`);
  logInfo(`Recovery Score : ${recoveryScore.score}/100 (${recoveryScore.rating})`);
  await runKernelResilience("recovery_finish", "success", runId);

  logInfo(`${PRODUCT.name} v${PRODUCT.version} terminé.`);
  process.exit(0);
}

main();
