// AutoUpdate_VX.js
// CosmoSafeMode Kernel Pro - AutoUpdate VX
// v3.0 - Update Civilization Engine
//
// RÔLE :
// - Comparer les versions locales des modules VX avec des versions "remote" (mock ou réelles plus tard)
// - Détecter les modules obsolètes, manquants ou incohérents
// - Calculer un UpdateScore + facteurs + criticité
// - Générer un Update Action Graph (immédiate / critique / préventive / optionnelle / premium)
// - Générer une Update Risk Map
// - Charger des plugins d’update (/plugins/update)
// - Générer un rapport JSON civilisationnel : autoupdate_map.json
// - Notifier KernelResilience d’une phase “update_check” avec runId
//
// Usage :
//   AutoUpdate_VX.exe --path="C:\\CosmoCodeUniverse" --mode=mock --runId=orchestrator_XXXX
//
//   mode : mock | file | remote
//   - mock  : versions distantes simulées en dur (dev/local)
//   - file  : versions distantes lues dans logs/remote_versions.json
//   - remote: (placeholder futur : API, URL, etc.)

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
  name: "AutoUpdate VX",
  version: "3.0.0",
  engine: "Update Civilization Engine",
};

const FILES = {
  autoupdateMap: "autoupdate_map.json",
  remoteVersions: "remote_versions.json", // pour mode file
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
  const logFile = path.join(logsDir, "autoupdate_vx.log");
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
// KERNEL RESILIENCE HOOK
// =========================

function runKernelResilience(phase, status, runId) {
  return new Promise((resolve) => {
    const args = [`--phase=${phase}`, `--status=${status}`, `--runId=${runId || `autoupdate_${Date.now()}`}`];
    logInfo(`→ [kernel-resilience] KernelResilience_VX.exe ${args.join(" ")}`);
    const child = spawn("KernelResilience_VX.exe", args, { stdio: "inherit" });

    child.on("exit", (code) => {
      logInfo(`← [kernel-resilience] Fin KernelResilience_VX.exe (code=${code})`);
      resolve(code);
    });
  });
}

// =========================
/* VERSIONS LOCALES */
// =========================

function getLocalVersions() {
  // v3.0 : aligné avec tes modules civilisationnels
  return {
    SafeMode_UltraFast_VX: "3.0.0",
    SafeMode_Debug_VX: "3.0.0",
    SafeMode_Watchdog_VX: "3.0.0",
    NexusInspector_VX: "3.0.0",
    MetaStabilizer_VX: "3.0.0",
    SelfRepair_VX: "3.0.0",
    AutoUpdate_VX: "3.0.0",
    KernelResilience_VX: "3.0.0",
    CosmoOrchestrator_VX: "3.0.0",
    RecoveryKernel_VX: "3.0.0",
  };
}

// =========================
/* VERSIONS DISTANTES */
// =========================

function getRemoteVersionsMock() {
  // Simule un backend qui a parfois des versions différentes
  return {
    SafeMode_UltraFast_VX: "3.0.0",
    SafeMode_Debug_VX: "3.0.1",
    SafeMode_Watchdog_VX: "3.0.0",
    NexusInspector_VX: "3.1.0",
    MetaStabilizer_VX: "3.0.0",
    SelfRepair_VX: "3.0.2",
    AutoUpdate_VX: "3.0.0",
    KernelResilience_VX: "3.0.0",
    CosmoOrchestrator_VX: "3.0.0",
    RecoveryKernel_VX: "3.0.0",
  };
}

function getRemoteVersionsFromFile() {
  const logsDir = ensureLogsDir();
  const full = path.join(logsDir, FILES.remoteVersions);
  if (!fs.existsSync(full)) {
    logWarn("remote_versions.json introuvable, fallback sur mock.");
    return getRemoteVersionsMock();
  }
  try {
    const raw = fs.readFileSync(full, "utf8");
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    logError("Erreur lecture remote_versions.json, fallback sur mock : " + e.message);
    return getRemoteVersionsMock();
  }
}

function getRemoteVersions(mode) {
  if (mode === "file") {
    return getRemoteVersionsFromFile();
  }
  if (mode === "remote") {
    // Placeholder pour futur backend (HTTP, API, etc.)
    logWarn("Mode remote non implémenté, fallback sur mock.");
    return getRemoteVersionsMock();
  }
  return getRemoteVersionsMock();
}

// =========================
/* ANALYTICS UPDATE */
// =========================

function compareVersions(local, remote) {
  const modules = new Set([...Object.keys(local), ...Object.keys(remote)]);
  const details = [];
  let upToDateCount = 0;
  let outdatedCount = 0;
  let missingLocalCount = 0;
  let missingRemoteCount = 0;

  for (const key of modules) {
    const lv = local[key] || null;
    const rv = remote[key] || null;

    let status = "match";
    if (lv && !rv) {
      status = "missing_remote";
      missingRemoteCount++;
    } else if (!lv && rv) {
      status = "missing_local";
      missingLocalCount++;
    } else if (lv && rv) {
      if (lv === rv) {
        status = "match";
        upToDateCount++;
      } else {
        status = "outdated";
        outdatedCount++;
      }
    }

    details.push({
      module: key,
      localVersion: lv,
      remoteVersion: rv,
      status,
    });
  }

  return {
    details,
    summary: {
      modulesCount: modules.size,
      upToDateCount,
      outdatedCount,
      missingLocalCount,
      missingRemoteCount,
    },
  };
}

// =========================
/* UPDATE SCORE ENGINE */
// =========================

function computeUpdateScore(comparison) {
  const { modulesCount, upToDateCount, outdatedCount, missingLocalCount, missingRemoteCount } =
    comparison.summary;

  if (modulesCount === 0) {
    return {
      score: 50,
      rating: "Inconnu",
      factors: [{ label: "Aucun module détecté", impact: "neutral" }],
    };
  }

  let score = 100;
  const factors = [];

  const outdatedRatio = outdatedCount / modulesCount;
  const missingRatio = (missingLocalCount + missingRemoteCount) / modulesCount;

  const outdatedPenalty = Math.round(outdatedRatio * 40);
  const missingPenalty = Math.round(missingRatio * 30);

  if (outdatedPenalty > 0) {
    score -= outdatedPenalty;
    factors.push({
      label: "Modules obsolètes",
      penalty: outdatedPenalty,
      detail: `${outdatedCount}/${modulesCount} modules`,
    });
  }

  if (missingPenalty > 0) {
    score -= missingPenalty;
    factors.push({
      label: "Modules manquants entre local et remote",
      penalty: missingPenalty,
      detail: `${missingLocalCount} manquants en local, ${missingRemoteCount} manquants en remote`,
    });
  }

  const upToDateRatio = upToDateCount / modulesCount;
  const upToDateBonus = Math.round(upToDateRatio * 20);
  score += upToDateBonus;
  factors.push({
    label: "Modules à jour",
    bonus: upToDateBonus,
    detail: `${upToDateCount}/${modulesCount} modules`,
  });

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
/* UPDATE ACTION ENGINE */
// =========================

function buildUpdateActionGraph(comparison, updateScore) {
  const actions = {
    immediate: [],
    critical: [],
    preventive: [],
    optional: [],
    premium: [],
  };

  const outdated = comparison.details.filter((d) => d.status === "outdated");
  const missingLocal = comparison.details.filter((d) => d.status === "missing_local");
  const missingRemote = comparison.details.filter((d) => d.status === "missing_remote");

  if (outdated.length > 0) {
    actions.immediate.push({
      id: "review_outdated_modules",
      label: "Passer en revue les modules obsolètes",
      reason: "Certaines versions locales sont en retard",
      modules: outdated.map((m) => m.module),
    });
  }

  if (updateScore.score < 60 && (outdated.length > 0 || missingLocal.length > 0)) {
    actions.critical.push({
      id: "plan_urgent_update",
      label: "Planifier une mise à jour urgente de l'écosystème",
      reason: "Score de mise à jour fragile ou critique",
    });
  }

  if (missingLocal.length > 0) {
    actions.critical.push({
      id: "align_local_with_remote",
      label: "Aligner les modules locaux avec les versions distantes",
      reason: "Des modules existent en remote mais pas en local",
      modules: missingLocal.map((m) => m.module),
    });
  }

  if (missingRemote.length > 0) {
    actions.preventive.push({
      id: "document_local_only_modules",
      label: "Documenter les modules présents uniquement en local",
      reason: "Des modules locaux n'existent pas côté remote",
      modules: missingRemote.map((m) => m.module),
    });
  }

  actions.optional.push({
    id: "generate_update_plan",
    label: "Générer un plan de mise à jour détaillé (manuel / semi‑automatique)",
    reason: "Préparation à une future automatisation des mises à jour",
  });

  if (updateScore.score >= 90 && outdated.length === 0 && missingLocal.length === 0) {
    actions.premium.push({
      id: "mark_universe_as_update_stable",
      label: "Marquer l'univers comme stable côté versions",
      reason: "Écosystème VX aligné avec les versions distantes",
    });
  }

  return actions;
}

// =========================
/* UPDATE RISK MAP */
// =========================

function computeUpdateRiskMap(comparison, updateScore) {
  const { modulesCount, outdatedCount, missingLocalCount, missingRemoteCount } =
    comparison.summary;

  let riskLevel = "low";

  if (
    updateScore.score < 50 ||
    outdatedCount > modulesCount / 2 ||
    missingLocalCount + missingRemoteCount > modulesCount / 2
  ) {
    riskLevel = "critical";
  } else if (
    updateScore.score < 75 ||
    outdatedCount > 0 ||
    missingLocalCount + missingRemoteCount > 0
  ) {
    riskLevel = "moderate";
  }

  return {
    modulesCount,
    outdatedCount,
    missingLocalCount,
    missingRemoteCount,
    updateScore: updateScore.score,
    updateRating: updateScore.rating,
    riskLevel,
  };
}

// =========================
/* PLUGIN ENGINE */
// =========================

function loadPlugins() {
  const pluginsDir = path.join(process.cwd(), "plugins", "update");
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
        logInfo(`Plugin update chargé : ${plugin.name || entry.name}`);
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

function generateRecommendations(comparison, updateScore, riskMap) {
  const recs = [];
  const { outdatedCount, missingLocalCount, missingRemoteCount } = comparison.summary;

  if (outdatedCount > 0) {
    recs.push("Mettre à jour en priorité les modules obsolètes pour rester aligné avec l'écosystème VX.");
  }

  if (missingLocalCount > 0) {
    recs.push("Installer les modules présents en remote mais absents en local si pertinents.");
  }

  if (missingRemoteCount > 0) {
    recs.push("Documenter les modules locaux sans équivalent remote, ou les intégrer dans la référence distante.");
  }

  if (riskMap.riskLevel === "critical") {
    recs.push("Risque de mismatch critique : planifier un chantier de mise à jour global.");
  }

  if (recs.length === 0) {
    recs.push("Aucune alerte majeure de mise à jour. L'univers VX est globalement aligné.");
  }

  recs.push(`Update Score : ${updateScore.score}/100 (${updateScore.rating}).`);

  return recs;
}

// =========================
/* REPORTING ENGINE */
// =========================

function buildAutoUpdateReport(target, runId, local, remote, comparison, updateScore, actions, riskMap, pluginResults) {
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
    versions: {
      local,
      remote,
      comparison,
    },
    analytics: {
      updateScore,
      riskMap,
      actions,
    },
    plugins: pluginResults,
    recommendations: generateRecommendations(comparison, updateScore, riskMap),
  };
}

// =========================
/* MAIN */
// =========================

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = args.path || process.cwd();
  const mode = args.mode || "mock"; // mock | file | remote
  const runId = args.runId || `autoupdate_${Date.now()}`;
  const pluginsEnabled = args.plugins !== "off" && args.plugins !== "false";

  logInfo(`=== ${PRODUCT.name} v${PRODUCT.version} (${PRODUCT.engine}) ===`);
  logInfo(`Target : ${target}`);
  logInfo(`Mode remote : ${mode}`);
  logInfo(`RunId : ${runId}`);
  logInfo(`Plugins : ${pluginsEnabled ? "activés" : "désactivés"}`);

  await runKernelResilience("update_check_start", "running", runId);

  const local = getLocalVersions();
  const remote = getRemoteVersions(mode);

  const comparison = compareVersions(local, remote);
  const updateScore = computeUpdateScore(comparison);
  const actions = buildUpdateActionGraph(comparison, updateScore);
  const riskMap = computeUpdateRiskMap(comparison, updateScore);

  let pluginResults = [];
  if (pluginsEnabled) {
    const plugins = loadPlugins();
    if (plugins.length > 0) {
      const context = {
        target,
        local,
        remote,
        comparison,
        updateScore,
        actions,
        riskMap,
        runId,
      };
      pluginResults = executePlugins(plugins, context);
    } else {
      logInfo("Aucun plugin d'update détecté.");
    }
  }

  const report = buildAutoUpdateReport(
    target,
    runId,
    local,
    remote,
    comparison,
    updateScore,
    actions,
    riskMap,
    pluginResults
  );

  const logsDir = ensureLogsDir();
  const outFile = path.join(logsDir, FILES.autoupdateMap);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), "utf8");

  logInfo(`AutoUpdate map générée : ${outFile}`);
  logInfo(`Update Score : ${updateScore.score}/100 (${updateScore.rating})`);

  await runKernelResilience("update_check_finish", "success", runId);

  logInfo(`${PRODUCT.name} v${PRODUCT.version} terminé.`);
  process.exit(0);
}

main();
