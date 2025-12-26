// CosmoOrchestrator_VX.js
// CosmoSafeMode Kernel Pro - CosmoOrchestrator VX
// v3.0 - Orchestrator Civilization Engine
//
// RÔLE :
// - Orchestrer le pipeline VX complet : SafeMode → Nexus → Meta → SelfRepair → AutoUpdate → KernelResilience
// - Lire les rapports JSON générés par les moteurs (nexus_map, meta_stability_map, selfrepair_map, kernel_resilience_map)
// - Adapter dynamiquement le pipeline (modes, arrêts, décisions) en fonction des risques et scores
// - Notifier KernelResilience à chaque phase avec phase/status/runId
// - Générer un orchestrator_map.json civilisationnel avec :
//     - phases, codes, durées
//     - décisions prises (modes, arrêts, escalades)
//     - synthèse risques & stabilité
//     - recommandations globales
//
// Usage :
//   CosmoOrchestrator_VX.exe --path="C:\\CosmoCodeUniverse" --repairMode=auto
//
//   repairMode : auto | simulate | apply | apply-safe | apply-aggressive
//   - auto : l’orchestrator choisit le mode idéal à partir des scores/risques
//   - les autres : forcent un mode pour SelfRepair

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

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// =========================
// CONFIG PRODUIT
// =========================

const PRODUCT = {
  name: "CosmoOrchestrator VX",
  version: "3.0.0",
  engine: "Orchestrator Civilization Engine",
};

const FILES = {
  nexusMap: "nexus_map.json",
  stabilityMap: "meta_stability_map.json",
  selfRepairMap: "selfrepair_map.json",
  resilienceMap: "kernel_resilience_map.json",
  orchestratorMap: "orchestrator_map.json",
};

// =========================
// LOGGING PREMIUM
// =========================

function ensureLogsDir() {
  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  return logsDir;
}

function log(msg) {
  const logsDir = ensureLogsDir();
  const logFile = path.join(logsDir, "orchestrator_vx.log");
  const ts = new Date().toISOString();
  fs.appendFileSync(logFile, `[${ts}] ${msg}\n`);
  console.log(msg);
}

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
// UTILITAIRES JSON
// =========================

function safeReadJson(fileName) {
  const logsDir = ensureLogsDir();
  const full = path.join(logsDir, fileName);
  if (!fs.existsSync(full)) return null;
  try {
    const raw = fs.readFileSync(full, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    log(`⚠️ Erreur lecture JSON (${fileName}) : ${e.message}`);
    return null;
  }
}

// =========================
// KERNEL RESILIENCE HOOK
// =========================

function runKernelResilience(phase, status, runId) {
  return new Promise((resolve) => {
    const args = [`--phase=${phase}`, `--status=${status}`, `--runId=${runId}`];
    log(`→ [kernel-resilience] KernelResilience_VX.exe ${args.join(" ")}`);
    const child = spawn("KernelResilience_VX.exe", args, { stdio: "inherit" });

    child.on("exit", (code) => {
      log(`← [kernel-resilience] Fin KernelResilience_VX.exe (code=${code})`);
      resolve(code);
    });
  });
}

// =========================
// RUN PROCESS WRAPPER
// =========================

async function runProcess(exe, args, phase, runId, orchestrationLog) {
  const start = Date.now();
  log(`→ [${phase}] Lancement : ${exe} ${args.join(" ")}`);
  await runKernelResilience(`start_${phase}`, "running", runId);

  return new Promise((resolve) => {
    const child = spawn(exe, args, { stdio: "inherit" });

    child.on("exit", async (code) => {
      const end = Date.now();
      const durationMs = end - start;

      log(`← [${phase}] Fin : ${exe} (code=${code}, durée=${durationMs}ms)`);

      const status = code === 0 ? "success" : "error";
      await runKernelResilience(phase, status, runId);

      orchestrationLog.phases.push({
        phase,
        exe,
        args,
        code,
        status,
        durationMs,
        at: new Date().toISOString(),
      });

      resolve({ code, durationMs });
    });
  });
}

// =========================
// DÉCISION : MODE SELFREPAIR
// =========================

function decideSelfRepairMode(requestedMode, stabilityReport) {
  // Si l’utilisateur force un mode, on le respecte (sauf auto)
  if (requestedMode && requestedMode !== "auto") {
    return { mode: requestedMode, reason: "Mode forcé par l'utilisateur" };
  }

  if (!stabilityReport || !stabilityReport.stabilityScore) {
    return { mode: "simulate", reason: "Pas de rapport de stabilité, simulate par sécurité" };
  }

  const score = stabilityReport.stabilityScore.score || 0;
  const riskLevel = stabilityReport.riskMap?.riskLevel || "unknown";

  if (score >= 85 && riskLevel === "moderate") {
    return { mode: "apply", reason: "Score élevé, risque modéré" };
  }

  if (score >= 70 && riskLevel !== "critical") {
    return { mode: "apply-safe", reason: "Score correct, prudence recommandée" };
  }

  if (riskLevel === "critical" || score < 50) {
    return { mode: "simulate", reason: "Risque critique ou score faible" };
  }

  return { mode: "apply-safe", reason: "Contexte standard, sécurité équilibrée" };
}

// =========================
// SYNTHÈSE RISQUE & STABILITÉ
// =========================

function synthesizeGlobalRisk(nexus, stability, selfrepair, resilience) {
  const out = {
    structuralRisk: "unknown",
    stabilityRisk: "unknown",
    repairSignals: "unknown",
    resilienceStatus: "unknown",
  };

  if (nexus && nexus.globalScore) {
    out.structuralRisk =
      nexus.globalScore.rating === "Excellent" || nexus.globalScore.rating === "Bon"
        ? "low"
        : "elevated";
  }

  if (stability && stability.stabilityScore) {
    out.stabilityRisk =
      stability.riskMap?.riskLevel === "critical" || stability.stabilityScore.score < 60
        ? "high"
        : "moderate";
  }

  if (selfrepair && Array.isArray(selfrepair.issues)) {
    out.repairSignals =
      selfrepair.issues.length === 0
        ? "clean"
        : selfrepair.riskMap?.riskLevel === "critical"
        ? "critical"
        : "needs_attention";
  }

  if (resilience && resilience.analytics?.resilienceScore) {
    const rScore = resilience.analytics.resilienceScore;
    out.resilienceStatus =
      rScore.score >= 80 ? "strong" : rScore.score >= 60 ? "normal" : "fragile";
  }

  return out;
}

// =========================
// RECOMMANDATIONS GLOBALES
// =========================

function generateGlobalRecommendations(orchestrationLog, globalRisk, selfRepairDecision) {
  const recs = [];

  const hadErrors = orchestrationLog.phases.some((p) => p.status === "error");
  if (hadErrors) {
    recs.push("Au moins une phase du pipeline a échoué : consulter les logs détaillés pour analyse.");
  }

  if (globalRisk.structuralRisk === "elevated") {
    recs.push("Risque structurel élevé : envisager une refactorisation partielle guidée par NexusInspector.");
  }

  if (globalRisk.stabilityRisk === "high") {
    recs.push("Risque de stabilité élevé : traiter les recommandations de MetaStabilizer en priorité.");
  }

  if (globalRisk.repairSignals === "critical") {
    recs.push("Signaux de réparation critiques : envisager un mode SelfRepair plus agressif après sauvegarde.");
  }

  if (globalRisk.resilienceStatus === "fragile") {
    recs.push("Résilience fragile : multiplier les runs contrôlés et documenter les phases instables.");
  }

  recs.push(
    `Mode SelfRepair utilisé : ${selfRepairDecision.mode} (${selfRepairDecision.reason}).`
  );

  if (recs.length === 0) {
    recs.push("Pipeline exécuté sans signal critique. Situation globale satisfaisante.");
  }

  return recs;
}

// =========================
// CONSTRUCTION DU RAPPORT ORCHESTRATOR
// =========================

function buildOrchestratorReport(target, runId, orchestrationLog, selfRepairDecision) {
  const nexus = safeReadJson(FILES.nexusMap);
  const stability = safeReadJson(FILES.stabilityMap);
  const selfrepair = safeReadJson(FILES.selfRepairMap);
  const resilience = safeReadJson(FILES.resilienceMap);

  const globalRisk = synthesizeGlobalRisk(nexus, stability, selfrepair, resilience);

  const recommendations = generateGlobalRecommendations(
    orchestrationLog,
    globalRisk,
    selfRepairDecision
  );

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
    pipeline: orchestrationLog,
    inputs: {
      nexus: !!nexus,
      stability: !!stability,
      selfrepair: !!selfrepair,
      resilience: !!resilience,
    },
    globalRisk,
    selfRepairDecision,
    recommendations,
  };
}

// =========================
// MAIN
// =========================

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = args.path;
  const requestedRepairMode = args.repairMode || "auto";

  if (!target) {
    console.error(
      "Usage: CosmoOrchestrator_VX.exe --path=C:\\CosmoCodeUniverse [--repairMode=auto|simulate|apply|apply-safe|apply-aggressive]"
    );
    process.exit(1);
  }

  const runId = `orchestrator_${Date.now()}`;
  const orchestrationLog = {
    runId,
    phases: [],
    startedAt: new Date().toISOString(),
  };

  log(`=== ${PRODUCT.name} v${PRODUCT.version} (${PRODUCT.engine}) ===`);
  log(`Dossier cible : ${target}`);
  log(`Mode réparation demandé : ${requestedRepairMode}`);
  log(`RunId : ${runId}`);

  // 0) KernelResilience - début global
  await runKernelResilience("orchestrator_start", "running", runId);

  // 1) SAFE MODE VX
  const safeArgs = [`--path=${target}`, "--mode=ultra"];
  const safeRes = await runProcess(
    "SafeMode_Watchdog_VX.exe",
    safeArgs,
    "safemode",
    runId,
    orchestrationLog
  );
  if (safeRes.code !== 0) {
    log("❌ SafeMode VX a échoué. Arrêt du pipeline.");
    await runKernelResilience("orchestrator_abort_safemode", "error", runId);
    await finalizeReport(target, runId, orchestrationLog, {
      mode: "n/a",
      reason: "SafeMode a échoué",
    });
    process.exit(1);
  }

  // 2) NEXUS INSPECTOR VX
  const nexusArgs = [`--path=${target}`];
  const nexusRes = await runProcess(
    "NexusInspector_VX.exe",
    nexusArgs,
    "nexus",
    runId,
    orchestrationLog
  );
  if (nexusRes.code !== 0) {
    log("❌ NexusInspector VX a échoué. Arrêt du pipeline.");
    await runKernelResilience("orchestrator_abort_nexus", "error", runId);
    await finalizeReport(target, runId, orchestrationLog, {
      mode: "n/a",
      reason: "NexusInspector a échoué",
    });
    process.exit(1);
  }

  // Relecture possible du rapport Nexus (facultatif pour décisions)
  const nexusReport = safeReadJson(FILES.nexusMap);

  // 3) META STABILIZER VX
  const metaArgs = [`--path=${target}`];
  const metaRes = await runProcess(
    "MetaStabilizer_VX.exe",
    metaArgs,
    "meta",
    runId,
    orchestrationLog
  );
  if (metaRes.code !== 0) {
    log("❌ MetaStabilizer VX a échoué. Arrêt du pipeline.");
    await runKernelResilience("orchestrator_abort_meta", "error", runId);
    await finalizeReport(target, runId, orchestrationLog, {
      mode: "n/a",
      reason: "MetaStabilizer a échoué",
    });
    process.exit(1);
  }

  const stabilityReport = safeReadJson(FILES.stabilityMap);

  // Décision du mode SelfRepair
  const selfRepairDecision = decideSelfRepairMode(requestedRepairMode, stabilityReport);
  log(
    `🧠 Décision SelfRepair : mode=${selfRepairDecision.mode} (raison=${selfRepairDecision.reason})`
  );

  // 4) SELF REPAIR VX
  const repairArgs = [`--path=${target}`, `--mode=${selfRepairDecision.mode}`];
  const repairRes = await runProcess(
    "SelfRepair_VX.exe",
    repairArgs,
    "selfrepair",
    runId,
    orchestrationLog
  );
  if (repairRes.code !== 0) {
    log("❌ SelfRepair VX a échoué. Arrêt du pipeline.");
    await runKernelResilience("orchestrator_abort_selfrepair", "error", runId);
    await finalizeReport(target, runId, orchestrationLog, selfRepairDecision);
    process.exit(1);
  }

  // 5) AUTO UPDATE VX
  const updateArgs = [`--path=${target}`];
  const updateRes = await runProcess(
    "AutoUpdate_VX.exe",
    updateArgs,
    "autoupdate",
    runId,
    orchestrationLog
  );
  if (updateRes.code !== 0) {
    log("❌ AutoUpdate VX a échoué. Arrêt du pipeline.");
    await runKernelResilience("orchestrator_abort_autoupdate", "error", runId);
    await finalizeReport(target, runId, orchestrationLog, selfRepairDecision);
    process.exit(1);
  }

  // 6) KernelResilience - fin global
  await runKernelResilience("orchestrator_finish", "success", runId);

  orchestrationLog.endedAt = new Date().toISOString();

  await finalizeReport(target, runId, orchestrationLog, selfRepairDecision);

  log("=== Pipeline VX v3.0 terminé ===");
  process.exit(0);
}

// =========================
// FINALISATION RAPPORT
// =========================

async function finalizeReport(target, runId, orchestrationLog, selfRepairDecision) {
  const report = buildOrchestratorReport(target, runId, orchestrationLog, selfRepairDecision);
  const logsDir = ensureLogsDir();
  const outFile = path.join(logsDir, FILES.orchestratorMap);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), "utf8");
  log(`🧭 Rapport d'orchestration généré : ${outFile}`);
}

// Lancement
main();
