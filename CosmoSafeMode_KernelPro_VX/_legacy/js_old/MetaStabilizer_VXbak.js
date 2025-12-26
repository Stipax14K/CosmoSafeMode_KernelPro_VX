// MetaStabilizer_VX.js
// v1.0 - Diagnostic de stabilité basé sur SafeMode + Nexus

const fs = require("fs");
const path = require("path");

function log(msg) {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    const logFile = path.join(logsDir, "metastabilizer_vx.log");
    const ts = new Date().toISOString();
    fs.appendFileSync(logFile, `[${ts}] ${msg}\n`);
    console.log(msg);
}

function parseArgs(argv) {
    const result = {};
    argv.forEach(arg => {
        const [k, v] = arg.split("=");
        if (k.startsWith("--")) result[k.slice(2)] = v;
    });
    return result;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const target = args.path;

    if (!target) {
        console.error("Usage: MetaStabilizer_VX.exe --path=C:\\CosmoCodeUniverse");
        process.exit(1);
    }

    log("=== MetaStabilizer VX v1.0 ===");
    log("Dossier cible : " + target);

    const logsDir = path.join(process.cwd(), "logs");
    const nexusMapFile = path.join(logsDir, "nexus_map.json");
    const metaReportFile = path.join(logsDir, "meta_report.json");

    if (!fs.existsSync(nexusMapFile)) {
        log("❌ nexus_map.json introuvable. Lancer NexusInspector d'abord.");
        process.exit(1);
    }

    const nexus = JSON.parse(fs.readFileSync(nexusMapFile, "utf8"));

    // Score simple: plus il y a d'anomalies et de fichiers zero_size, plus le score baisse.
    const totalFiles = nexus.totalFiles || 0;
    const anomalies = nexus.anomalies || [];
    const zeroSizeCount = anomalies.filter(a => a.type === "zero_size").length;
    const readErrors = anomalies.filter(a => a.type.endsWith("error")).length;

    let score = 100;
    score -= zeroSizeCount * 0.2;
    score -= readErrors * 1;

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    const report = {
        target,
        totalFiles,
        totalDirs: nexus.totalDirs || 0,
        totalSize: nexus.totalSize || 0,
        anomaliesCount: anomalies.length,
        zeroSizeCount,
        readErrors,
        stabilityScore: Math.round(score),
        generatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(metaReportFile, JSON.stringify(report, null, 2), "utf8");
    log("Rapport Meta généré : " + metaReportFile);
    log("Score de stabilité : " + report.stabilityScore + "/100");

    log("MetaStabilizer VX v1.0 terminé.");
    process.exit(0);
}

main();
