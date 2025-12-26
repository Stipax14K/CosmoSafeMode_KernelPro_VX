async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  return res.json();
}

function renderMeta(meta) {
  const el = document.getElementById("cc-meta");
  el.textContent = `${meta.product} v${meta.version} — généré à ${meta.generatedAt}`;
}

function scoreToClass(score) {
  if (!score || typeof score.score !== "number") return "score-unknown";
  if (score.score >= 90) return "score-excellent";
  if (score.score >= 75) return "score-good";
  if (score.score >= 60) return "score-medium";
  if (score.score >= 40) return "score-fragile";
  return "score-critical";
}

function riskLevelToClass(level) {
  if (!level) return "risk-unknown";
  if (level === "low") return "risk-low";
  if (level === "moderate") return "risk-medium";
  if (level === "critical") return "risk-critical";
  return "risk-unknown";
}

function renderOverview(data) {
  renderMeta(data.meta);
  const container = document.getElementById("overview");
  container.innerHTML = "";

  const entries = [
    { key: "nexus", label: "NexusInspector", score: data.scores.nexus },
    { key: "meta", label: "MetaStabilizer", score: data.scores.meta, risk: data.risks.meta },
    { key: "selfrepair", label: "SelfRepair", score: data.scores.selfrepair, risk: data.risks.selfrepair },
    { key: "resilience", label: "KernelResilience", score: data.scores.resilience, risk: data.risks.resilience },
    { key: "orchestrator", label: "CosmoOrchestrator", score: null, risk: data.risks.orchestrator },
    { key: "recovery", label: "RecoveryKernel", score: data.scores.recovery, risk: data.risks.recovery },
    { key: "autoupdate", label: "AutoUpdate", score: data.scores.autoupdate, risk: data.risks.autoupdate }
  ];

  for (const e of entries) {
    const card = document.createElement("div");
    card.className = "cc-card";

    const title = document.createElement("div");
    title.className = "cc-card-title";
    title.textContent = e.label;
    card.appendChild(title);

    const status = document.createElement("div");
    status.className = "cc-card-body";

    const scoreSpan = document.createElement("span");
    scoreSpan.className = `cc-chip ${scoreToClass(e.score)}`;
    scoreSpan.textContent = e.score
      ? `Score: ${e.score.score}/100 (${e.score.rating})`
      : "Score: n/a";
    status.appendChild(scoreSpan);

    if (e.risk && e.risk.riskLevel) {
      const riskSpan = document.createElement("span");
      riskSpan.className = `cc-chip ${riskLevelToClass(e.risk.riskLevel)}`;
      riskSpan.textContent = `Risque: ${e.risk.riskLevel}`;
      status.appendChild(riskSpan);
    }

    card.appendChild(status);
    container.appendChild(card);
  }
}

async function loadOverview() {
  const data = await fetchJson("/api/overview");
  renderOverview(data);
}

async function loadModuleDetails(moduleKey) {
  const map = {
    nexus: "/api/nexus",
    meta: "/api/meta",
    selfrepair: "/api/selfrepair",
    resilience: "/api/resilience",
    orchestrator: "/api/orchestrator",
    recovery: "/api/recovery",
    autoupdate: "/api/autoupdate"
  };

  const url = map[moduleKey];
  const pre = document.getElementById("module-details");
  pre.textContent = "Chargement...";

  try {
    const data = await fetchJson(url);
    pre.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    pre.textContent = "Erreur: " + e.message;
  }
}

function initTabs() {
  const buttons = document.querySelectorAll(".cc-tabs button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadModuleDetails(btn.getAttribute("data-module"));
    });
  });

  const first = buttons[0];
  if (first) {
    first.classList.add("active");
    loadModuleDetails(first.getAttribute("data-module"));
  }
}

async function runModule(module) {
  const output = document.getElementById("action-output");
  output.textContent = `Lancement de ${module}...\n`;

  const res = await fetchJson(`/api/run/${module}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ args: [] })
  });

  output.textContent += JSON.stringify(res, null, 2);
}

function initActions() {
  const buttons = document.querySelectorAll(".cc-actions button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const module = btn.getAttribute("data-run");
      runModule(module);
    });
  });
}

/* === AJOUT DEMANDÉ === */
document.getElementById("simulate-all").addEventListener("click", async () => {
  const output = document.getElementById("action-output");
  output.textContent = "Simulation en cours...\n";

  const res = await fetch("/api/run/simulation", {
    method: "POST"
  });

  const data = await res.json();
  output.textContent += JSON.stringify(data, null, 2);
});
/* ===================== */

window.addEventListener("DOMContentLoaded", () => {
  loadOverview();
  initTabs();
  initActions();
});
