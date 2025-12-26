// ControlCenter_Server_VX.js
// CosmoSafeMode Kernel Pro - Control Center VX
// v1.1 - Web Dashboard Civilization Engine (config-aware)

const express = require("express");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// =========================
// CONFIG
// =========================

const ROOT = path.join(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "config.json");

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("[ERROR] Impossible de lire config.json :", e.message);
    return {
      productName: "CosmoSafeMode Kernel Pro - VX Edition",
      version: "3.0.0",
      controlCenterPort: 3080,
      demoMode: false,
      simulationMode: false
    };
  }
}

let CONFIG = loadConfig();
const PORT = CONFIG.controlCenterPort || 3080;

// =========================
// LOGGING
// =========================

function ensureLogsDir() {
  const logsDir = path.join(ROOT, "logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  return logsDir;
}

function log(msg) {
  const logsDir = ensureLogsDir();
  const logFile = path.join(logsDir, "controlcenter_vx.log");
  const ts = new Date().toISOString();
  const line = `[${ts}] [INFO] ${msg}`;
  fs.appendFileSync(logFile, line + "\n");
  console.log(line);
}

// =========================
// JSON LOADER
// =========================

function safeReadJson(fileName) {
  const logsDir = ensureLogsDir();
  const full = path.join(logsDir, fileName);
  if (!fs.existsSync(full)) return null;
  try {
    const raw = fs.readFileSync(full, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    log(`Erreur lecture JSON (${fileName}) : ${e.message}`);
    return null;
  }
}

// =========================
// EXPRESS APP
// =========================

const app = express();
app.use(express.json());

// Static UI
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// =========================
// API: CONFIG
// =========================

app.get("/api/config", (req, res) => {
  CONFIG = loadConfig(); // reload live
  res.json(CONFIG);
});

// =========================
// API: OVERVIEW
// =========================

const FILES = {
  nexus: "nexus_map.json",
  meta: "meta_stability_map.json",
  selfrepair: "selfrepair_map.json",
  resilience: "kernel_resilience_map.json",
  orchestrator: "orchestrator_map.json",
  recovery: "recovery_map.json",
  autoupdate: "autoupdate_map.json"
};

app.get("/api/overview", (req, res) => {
  const nexus = safeReadJson(FILES.nexus);
  const meta = safeReadJson(FILES.meta);
  const selfrepair = safeReadJson(FILES.selfrepair);
  const resilience = safeReadJson(FILES.resilience);
  const orchestrator = safeReadJson(FILES.orchestrator);
  const recovery = safeReadJson(FILES.recovery);
  const autoupdate = safeReadJson(FILES.autoupdate);

  res.json({
    meta: {
      product: CONFIG.productName,
      version: CONFIG.version,
      generatedAt: new Date().toISOString(),
      demoMode: CONFIG.demoMode,
      simulationMode: CONFIG.simulationMode
    },
    modules: {
      nexus: !!nexus,
      meta: !!meta,
      selfrepair: !!selfrepair,
      resilience: !!resilience,
      orchestrator: !!orchestrator,
      recovery: !!recovery,
      autoupdate: !!autoupdate
    },
    scores: {
      nexus: nexus?.globalScore || null,
      meta: meta?.stabilityScore || null,
      selfrepair: selfrepair?.selfRepairScore || null,
      resilience: resilience?.analytics?.resilienceScore || null,
      orchestratorGlobalRisk: orchestrator?.globalRisk || null,
      recovery: recovery?.recoveryScore || null,
      autoupdate: autoupdate?.analytics?.updateScore || null
    },
    risks: {
      meta: meta?.riskMap || null,
      selfrepair: selfrepair?.riskMap || null,
      resilience: resilience?.analytics?.riskMap || null,
      orchestrator: orchestrator?.globalRisk || null,
      recovery: recovery?.riskMap || null,
      autoupdate: autoupdate?.analytics?.riskMap || null
    }
  });
});

// =========================
// API: DETAILS PAR MODULE
// =========================

app.get("/api/nexus", (req, res) => res.json(safeReadJson(FILES.nexus) || {}));
app.get("/api/meta", (req, res) => res.json(safeReadJson(FILES.meta) || {}));
app.get("/api/selfrepair", (req, res) => res.json(safeReadJson(FILES.selfrepair) || {}));
app.get("/api/resilience", (req, res) => res.json(safeReadJson(FILES.resilience) || {}));
app.get("/api/orchestrator", (req, res) => res.json(safeReadJson(FILES.orchestrator) || {}));
app.get("/api/recovery", (req, res) => res.json(safeReadJson(FILES.recovery) || {}));
app.get("/api/autoupdate", (req, res) => res.json(safeReadJson(FILES.autoupdate) || {}));

// =========================
// API: LANCEMENT DES MOTEURS
// (préparé pour les .exe v3.0)
// =========================

function runExecutable(exeName, args = []) {
  return new Promise((resolve) => {
    const exePath = path.join(ROOT, "bin", exeName);

    if (!fs.existsSync(exePath)) {
      return resolve({
        ok: false,
        error: `Executable introuvable : ${exeName}`
      });
    }

    const child = spawn(exePath, args, { stdio: "inherit" });

    child.on("exit", (code) => {
      resolve({
        ok: code === 0,
        code
      });
    });
  });
}

app.post("/api/run/:module", async (req, res) => {
  const module = req.params.module;
  const args = req.body.args || [];

  const exeMap = {
    orchestrator: "CosmoOrchestrator_VX.exe",
    recovery: "RecoveryKernel_VX.exe",
    autoupdate: "AutoUpdate_VX.exe",
    selfrepair: "SelfRepair_VX.exe",
    safemode: "SafeMode_Watchdog_VX.exe"
  };

  if (!exeMap[module]) {
    return res.json({ ok: false, error: "Module inconnu" });
  }

  const result = await runExecutable(exeMap[module], args);
  res.json(result);
});

// =========================
// API: PING
// =========================

app.get("/api/ping", (req, res) => {
  res.json({
    ok: true,
    product: CONFIG.productName,
    version: CONFIG.version,
    at: new Date().toISOString()
  });
});

// =========================
// SERVER START
// =========================

app.listen(PORT, () => {
  log(`${CONFIG.productName} démarré sur http://localhost:${PORT}`);
  log(`UI disponible sur http://localhost:${PORT}/`);
});

app.post("/api/run/simulation", async (req, res) => {
  const simulateScript = path.join(ROOT, "simulate_all.js");

  const child = spawn("node", [simulateScript], {
    cwd: ROOT,
    stdio: "inherit"
  });

  child.on("exit", (code) => {
    res.json({
      ok: code === 0,
      code,
      message: "Simulation terminée"
    });
  });
});
