// NexusInspector_VX.js
// CosmoSafeMode Kernel Pro - NexusInspector VX
// v3.0 - Civilizational Scan Engine
//
// RÔLE :
// - Scanner un répertoire (structure, volume, extensions, anomalies)
// - Détecter la nature du projet (signatures Node, Web, Python, etc.)
// - Appliquer des règles heuristiques et corrélatives
// - Calculer un Nexus Health Score détaillé + sous-scores
// - Charger des plugins d'analyse complémentaires
// - Générer un rapport JSON structuré, prêt pour UI / SaaS / export
//
// Usage :
//   NexusInspector_VX.exe --path="C:\\CosmoCodeUniverse"
//   NexusInspector_VX.exe --path="C:\\Projet" --maxDepth=8 --outputName=nexus_map.json
//   NexusInspector_VX.exe --path="C:\\Projet" --plugins=on

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
  name: "NexusInspector VX",
  version: "3.0.0",
  engine: "Nexus Scan Engine",
};

const DEFAULTS = {
  maxDepth: 6,
  outputName: "nexus_map.json",
  plugins: true,
};

const KNOWN_SIGNATURES = {
  node: {
    id: "node_project",
    label: "Projet Node.js",
    weight: 2,
    files: ["package.json"],
    folders: ["node_modules"],
  },
  frontend: {
    id: "frontend_web",
    label: "Projet Frontend Web",
    weight: 1.5,
    files: ["vite.config.js", "webpack.config.js", "index.html"],
    folders: ["dist", "build"],
  },
  python: {
    id: "python_project",
    label: "Projet Python",
    weight: 1.5,
    files: ["requirements.txt", "pyproject.toml", "setup.py"],
    folders: ["venv", ".venv"],
  },
  dotnet: {
    id: "dotnet_project",
    label: "Projet .NET",
    weight: 1.5,
    files: [".csproj", ".sln"],
    folders: ["bin", "obj"],
  },
  php: {
    id: "php_project",
    label: "Projet PHP",
    weight: 1.0,
    files: ["composer.json"],
    folders: ["vendor"],
  },
};

// =========================
// UTILITAIRES LOG & FS
// =========================

function ensureLogsDir() {
  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  return logsDir;
}

function logRaw(line) {
  console.log(line);
}

function log(level, msg) {
  const logsDir = ensureLogsDir();
  const logFile = path.join(logsDir, "nexusinspector_vx.log");
  const ts = new Date().toISOString();
  const prefix = {
    info: "[INFO]",
    warn: "[WARN]",
    error: "[ERROR]",
    debug: "[DEBUG]",
  }[level] || "[INFO]";

  const line = `[${ts}] ${prefix} ${msg}`;
  fs.appendFileSync(logFile, line + "\n");
  logRaw(line);
}

function logInfo(msg) {
  log("info", msg);
}
function logWarn(msg) {
  log("warn", msg);
}
function logError(msg) {
  log("error", msg);
}
function logDebug(msg) {
  log("debug", msg);
}

// =========================
// PARSING ARGUMENTS
// =========================

function parseArgs(argv) {
  const result = {};
  argv.forEach((arg) => {
    const [k, v] = arg.split("=");
    if (k && k.startsWith("--")) {
      const key = k.slice(2);
      result[key] = v === undefined ? true : v;
    }
  });
  return result;
}

// =========================
// ANALYSE STRUCTURELLE (CORE ENGINE)
// =========================

function analyzeDirectory(rootDir, maxDepth) {
  const summary = {
    product: PRODUCT.name,
    version: PRODUCT.version,
    engine: PRODUCT.engine,
    root: path.resolve(rootDir),
    timestamp: new Date().toISOString(),

    totalFiles: 0,
    totalDirs: 0,
    totalSize: 0,

    byExtension: {},
    folders: {},
    anomalies: [],
  };

  function pushAnomaly(anomaly) {
    summary.anomalies.push({
      ...anomaly,
      timestamp: new Date().toISOString(),
    });
  }

  function markFolderType(folderPath) {
    const name = path.basename(folderPath).toLowerCase();
    if (!summary.folders[name]) {
      summary.folders[name] = { count: 0, paths: [] };
    }
    summary.folders[name].count++;
    if (summary.folders[name].paths.length < 20) {
      summary.folders[name].paths.push(folderPath);
    }
  }

  function walk(current, depth) {
    if (depth > maxDepth) return;

    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch (e) {
      pushAnomaly({
        type: "read_error",
        path: current,
        error: e.message,
      });
      return;
    }

    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        summary.totalDirs++;
        markFolderType(full);
        walk(full, depth + 1);
      } else if (entry.isFile()) {
        summary.totalFiles++;
        let size = 0;
        try {
          size = fs.statSync(full).size;
        } catch (e) {
          pushAnomaly({
            type: "stat_error",
            path: full,
            error: e.message,
          });
        }
        summary.totalSize += size;

        const ext = path.extname(entry.name).toLowerCase() || "<none>";
        if (!summary.byExtension[ext]) {
          summary.byExtension[ext] = { count: 0, size: 0, samplePaths: [] };
        }
        const extInfo = summary.byExtension[ext];
        extInfo.count++;
        extInfo.size += size;
        if (extInfo.samplePaths.length < 20) {
          extInfo.samplePaths.push(full);
        }

        if (size === 0) {
          pushAnomaly({
            type: "zero_size",
            path: full,
          });
        }
      }
    }
  }

  walk(rootDir, 0);
  return summary;
}

// =========================
// SIGNATURE ENGINE
// =========================

function detectFilePresence(rootDir, patterns) {
  const found = [];
  for (const p of patterns) {
    if (p.includes(".")) {
      // fichier (exact ou pattern simple)
      const basename = p;
      try {
        const matches = findFiles(rootDir, basename, 4);
        if (matches.length > 0) {
          found.push({ pattern: p, matches });
        }
      } catch {}
    }
  }
  return found;
}

function detectFolderPresence(summary, folderNames) {
  const found = [];
  for (const n of folderNames) {
    const key = n.toLowerCase();
    if (summary.folders[key] && summary.folders[key].count > 0) {
      found.push({
        pattern: n,
        count: summary.folders[key].count,
        samplePaths: summary.folders[key].paths,
      });
    }
  }
  return found;
}

function findFiles(rootDir, fileName, maxDepth) {
  const results = [];
  function walk(current, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(current, e.name);
      if (e.isDirectory()) {
        walk(full, depth + 1);
      } else if (e.isFile()) {
        if (e.name === fileName || (fileName.startsWith(".") && e.name.endsWith(fileName))) {
          results.push(full);
        }
      }
    }
  }
  walk(rootDir, 0);
  return results;
}

function detectProjectSignatures(rootDir, summary) {
  const signatures = [];

  for (const [key, sig] of Object.entries(KNOWN_SIGNATURES)) {
    const fileMatches = detectFilePresence(rootDir, sig.files || []);
    const folderMatches = detectFolderPresence(summary, sig.folders || []);

    if (fileMatches.length > 0 || folderMatches.length > 0) {
      signatures.push({
        id: sig.id,
        label: sig.label,
        weight: sig.weight,
        files: fileMatches,
        folders: folderMatches,
      });
    }
  }

  return signatures;
}

// =========================
// HEURISTIC ENGINE
// =========================

function analyzeHeuristics(rootDir, summary, signatures) {
  const heuristics = [];

  const totalFiles = summary.totalFiles || 0;
  const totalDirs = summary.totalDirs || 0;
  const anomaliesCount = (summary.anomalies || []).length;
  const extCount = Object.keys(summary.byExtension || {}).length;

  if (signatures.find((s) => s.id === "node_project")) {
    const nodeModules = summary.folders["node_modules"];
    if (nodeModules && nodeModules.count > 0) {
      heuristics.push({
        id: "node_large_modules",
        category: "performance",
        label: "Présence de node_modules (potentiellement massif)",
        severity: "medium",
        details: {
          count: nodeModules.count,
          samplePaths: nodeModules.paths,
        },
      });
    }
  }

  if (totalFiles > 50000) {
    heuristics.push({
      id: "huge_file_count",
      category: "structure",
      label: "Très grand nombre de fichiers",
      severity: "high",
      details: {
        totalFiles,
      },
    });
  }

  if (totalDirs > 3000) {
    heuristics.push({
      id: "deep_tree",
      category: "structure",
      label: "Arborescence très profonde ou très fragmentée",
      severity: "medium",
      details: {
        totalDirs,
      },
    });
  }

  if (extCount > 120) {
    heuristics.push({
      id: "high_extension_diversity",
      category: "coherence",
      label: "Diversité d'extensions très élevée",
      severity: "medium",
      details: {
        extensionsCount: extCount,
      },
    });
  }

  if (anomaliesCount > 50) {
    heuristics.push({
      id: "many_anomalies",
      category: "health",
      label: "Grand nombre d'anomalies détectées",
      severity: "high",
      details: {
        anomaliesCount,
      },
    });
  }

  return heuristics;
}

// =========================
// CORRELATION ENGINE
// =========================

function analyzeCorrelations(summary, signatures, heuristics) {
  const correlations = [];

  const isNode = signatures.some((s) => s.id === "node_project");
  const nodeModules = summary.folders["node_modules"];
  const anomaliesCount = (summary.anomalies || []).length;

  if (isNode && nodeModules && nodeModules.count > 0 && anomaliesCount > 0) {
    correlations.push({
      id: "node_anomalies_correlation",
      label: "Corrélation entre projet Node.js, node_modules et anomalies",
      severity: "medium",
      details: {
        nodeModulesCount: nodeModules.count,
        anomaliesCount,
      },
    });
  }

  const hugeTreeHeuristic = heuristics.find((h) => h.id === "huge_file_count");
  const deepTreeHeuristic = heuristics.find((h) => h.id === "deep_tree");
  if (hugeTreeHeuristic && deepTreeHeuristic) {
    correlations.push({
      id: "huge_and_deep_structure",
      label: "Structure très volumineuse ET profonde",
      severity: "high",
      details: {
        files: hugeTreeHeuristic.details.totalFiles,
        dirs: deepTreeHeuristic.details.totalDirs,
      },
    });
  }

  return correlations;
}

// =========================
// PLUGIN ENGINE
// =========================

function loadPlugins(rootDir) {
  const pluginsDir = path.join(process.cwd(), "plugins", "nexus");
  const plugins = [];
  if (!fs.existsSync(pluginsDir)) {
    return plugins;
  }

  const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".js")) continue;

    const full = path.join(pluginsDir, entry.name);
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const plugin = require(full);
      if (plugin && typeof plugin.run === "function") {
        plugins.push({
          name: plugin.name || entry.name,
          version: plugin.version || "1.0.0",
          description: plugin.description || "",
          run: plugin.run,
        });
        logInfo(`Plugin Nexus chargé : ${plugin.name || entry.name}`);
      } else {
        logWarn(`Plugin ignoré (pas de méthode run) : ${entry.name}`);
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
      const res = p.run(context) || {};
      results.push({
        name: p.name,
        version: p.version,
        output: res,
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

function computeHealthScore(summary, signatures, heuristics, correlations, pluginResults) {
  let score = 100;
  const factors = [];

  const totalFiles = summary.totalFiles || 0;
  const totalDirs = summary.totalDirs || 0;
  const anomaliesCount = (summary.anomalies || []).length;
  const extCount = Object.keys(summary.byExtension || {}).length;

  if (anomaliesCount > 0) {
    const penalty = Math.min(40, anomaliesCount * 1.5);
    score -= penalty;
    factors.push({
      label: "Anomalies détectées",
      penalty,
      details: `${anomaliesCount} anomalies trouvées`,
      category: "health",
    });
  }

  let zeroSizeCount = 0;
  for (const a of summary.anomalies || []) {
    if (a.type === "zero_size") zeroSizeCount++;
  }
  if (zeroSizeCount > 0) {
    const penalty = Math.min(15, zeroSizeCount * 0.5);
    score -= penalty;
    factors.push({
      label: "Fichiers taille zéro",
      penalty,
      details: `${zeroSizeCount} fichiers vides détectés`,
      category: "health",
    });
  }

  if (extCount > 80) {
    const penalty = 8;
    score -= penalty;
    factors.push({
      label: "Diversité d'extensions élevée",
      penalty,
      details: `${extCount} extensions différentes`,
      category: "coherence",
    });
  }

  if (totalFiles > 50000) {
    const penalty = 15;
    score -= penalty;
    factors.push({
      label: "Très grand nombre de fichiers",
      penalty,
      details: `${totalFiles} fichiers`,
      category: "structure",
    });
  } else if (totalFiles > 20000) {
    const penalty = 8;
    score -= penalty;
    factors.push({
      label: "Nombre de fichiers élevé",
      penalty,
      details: `${totalFiles} fichiers`,
      category: "structure",
    });
  }

  if (totalDirs > 3000) {
    const penalty = 10;
    score -= penalty;
    factors.push({
      label: "Arborescence très profonde/fragmentée",
      penalty,
      details: `${totalDirs} dossiers`,
      category: "structure",
    });
  }

  if (summary.totalSize > 10 * 1024 * 1024 * 1024) {
    const penalty = 10;
    score -= penalty;
    factors.push({
      label: "Volume de données massif",
      penalty,
      details: `${summary.totalSize} octets`,
      category: "volume",
    });
  }

  for (const h of heuristics || []) {
    if (h.severity === "high") {
      const penalty = 6;
      score -= penalty;
      factors.push({
        label: `Heuristique critique : ${h.label}`,
        penalty,
        category: h.category || "heuristic",
      });
    } else if (h.severity === "medium") {
      const penalty = 3;
      score -= penalty;
      factors.push({
        label: `Heuristique : ${h.label}`,
        penalty,
        category: h.category || "heuristic",
      });
    }
  }

  for (const c of correlations || []) {
    const penalty = c.severity === "high" ? 5 : 3;
    score -= penalty;
    factors.push({
      label: `Corrélation : ${c.label}`,
      penalty,
      category: "correlation",
    });
  }

  for (const pr of pluginResults || []) {
    if (!pr.output || !pr.output.penalty) continue;
    const pval = pr.output.penalty.value || 0;
    if (pval > 0) {
      score -= pval;
      factors.push({
        label: `Plugin ${pr.name} : ${pr.output.penalty.label || "Pénalité"}`,
        penalty: pval,
        category: pr.output.penalty.category || "plugin",
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

  const subScores = {
    structure: clampScore(100 - sumPenalties(factors, ["structure"])),
    volume: clampScore(100 - sumPenalties(factors, ["volume"])),
    health: clampScore(100 - sumPenalties(factors, ["health"])),
    coherence: clampScore(100 - sumPenalties(factors, ["coherence"])),
    heuristic: clampScore(100 - sumPenalties(factors, ["heuristic"])),
    correlation: clampScore(100 - sumPenalties(factors, ["correlation"])),
    plugin: clampScore(100 - sumPenalties(factors, ["plugin"])),
  };

  return {
    score,
    rating,
    factors,
    subScores,
  };
}

function sumPenalties(factors, categories) {
  return factors
    .filter((f) => categories.includes(f.category))
    .reduce((acc, f) => acc + (f.penalty || 0), 0);
}

function clampScore(s) {
  if (s < 0) return 0;
  if (s > 100) return 100;
  return s;
}

// =========================
// REPORTING ENGINE
// =========================

function buildReport(rootDir, summary, signatures, heuristics, correlations, pluginResults) {
  const health = computeHealthScore(summary, signatures, heuristics, correlations, pluginResults);

  const topExtensions = Object.entries(summary.byExtension || {})
    .map(([ext, info]) => ({
      extension: ext,
      count: info.count,
      size: info.size,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const report = {
    meta: {
      product: PRODUCT.name,
      version: PRODUCT.version,
      engine: PRODUCT.engine,
      generatedAt: new Date().toISOString(),
    },
    context: {
      root: path.resolve(rootDir),
    },
    metrics: {
      totalFiles: summary.totalFiles,
      totalDirs: summary.totalDirs,
      totalSize: summary.totalSize,
      extensionsCount: Object.keys(summary.byExtension || {}).length,
    },
    signatures,
    heuristics,
    correlations,
    health,
    topExtensions,
    anomalies: summary.anomalies,
    plugins: pluginResults,
  };

  return report;
}

// =========================
// MAIN / ORCHESTRATION
// =========================

function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = args.path;
  const maxDepth = args.maxDepth ? parseInt(args.maxDepth, 10) : DEFAULTS.maxDepth;
  const outputName = args.outputName || DEFAULTS.outputName;
  const pluginsEnabled = args.plugins !== "off" && args.plugins !== "false";

  if (!target) {
    logError("Aucun chemin spécifié. Utilisation : NexusInspector_VX.exe --path=C:\\Chemin\\Vers\\Projet");
    process.exit(1);
  }

  logInfo(`=== ${PRODUCT.name} v${PRODUCT.version} (${PRODUCT.engine}) ===`);
  logInfo(`Dossier cible : ${target}`);
  logInfo(`Profondeur maximale : ${maxDepth}`);
  logInfo(`Fichier de sortie : ${outputName}`);
  logInfo(`Plugins : ${pluginsEnabled ? "activés" : "désactivés"}`);

  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    logError("Dossier cible invalide ou inaccessible.");
    process.exit(1);
  }

  try {
    logInfo("Analyse structurelle (Core Engine) en cours...");
    const summary = analyzeDirectory(target, maxDepth);

    logInfo("Détection des signatures de projet (Signature Engine)...");
    const signatures = detectProjectSignatures(target, summary);

    logInfo("Analyse heuristique (Heuristic Engine)...");
    const heuristics = analyzeHeuristics(target, summary, signatures);

    logInfo("Analyse des corrélations (Correlation Engine)...");
    const correlations = analyzeCorrelations(summary, signatures, heuristics);

    let pluginResults = [];
    if (pluginsEnabled && DEFAULTS.plugins) {
      logInfo("Chargement des plugins Nexus (Plugin Engine)...");
      const plugins = loadPlugins(target);
      if (plugins.length > 0) {
        logInfo(`Plugins détectés : ${plugins.length}`);
        const context = { rootDir: target, summary, signatures, heuristics, correlations };
        logInfo("Exécution des plugins...");
        pluginResults = executePlugins(plugins, context);
      } else {
        logInfo("Aucun plugin Nexus détecté.");
      }
    }

    logInfo("Construction du rapport Nexus (Reporting Engine)...");
    const report = buildReport(target, summary, signatures, heuristics, correlations, pluginResults);

    const logsDir = ensureLogsDir();
    const mapFile = path.join(logsDir, outputName);

    fs.writeFileSync(mapFile, JSON.stringify(report, null, 2), "utf8");

    logInfo(`Carte Nexus générée : ${mapFile}`);
    logInfo(
      `Résumé : fichiers=${summary.totalFiles}, dossiers=${summary.totalDirs}, taille=${summary.totalSize} octets`
    );
    logInfo(
      `Nexus Health Score : ${report.health.score}/100 (${report.health.rating}) [structure=${report.health.subScores.structure}, volume=${report.health.subScores.volume}, santé=${report.health.subScores.health}]`
    );

    const anomaliesCount = (summary.anomalies || []).length;
    if (anomaliesCount > 0) {
      logWarn(`Anomalies détectées : ${anomaliesCount} (voir rapport pour le détail).`);
    } else {
      logInfo("Aucune anomalie structurale détectée.");
    }

    if (signatures.length > 0) {
      const sigLabels = signatures.map((s) => s.label).join(", ");
      logInfo(`Signatures projet détectées : ${sigLabels}`);
    }

    if (pluginResults.length > 0) {
      logInfo(`Résultats plugins : ${pluginResults.length} plugins exécutés.`);
    }

    logInfo(`${PRODUCT.name} v${PRODUCT.version} terminé avec succès.`);
    process.exit(0);
  } catch (e) {
    logError("Erreur inattendue pendant l'analyse : " + e.message);
    process.exit(2);
  }
}

main();
