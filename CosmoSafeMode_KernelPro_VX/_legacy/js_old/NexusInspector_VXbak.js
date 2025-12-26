// NexusInspector_VX.js
// v1.0 - Analyse structurelle et génération d'une carte JSON

const fs = require("fs");
const path = require("path");

function log(msg) {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    const logFile = path.join(logsDir, "nexusinspector_vx.log");
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

function analyzeDirectory(rootDir, maxDepth = 6) {
    const summary = {
        root: rootDir,
        totalFiles: 0,
        totalDirs: 0,
        totalSize: 0,
        byExtension: {},
        anomalies: [],
    };

    function walk(current, depth) {
        if (depth > maxDepth) return;

        let entries;
        try {
            entries = fs.readdirSync(current, { withFileTypes: true });
        } catch (e) {
            summary.anomalies.push({ type: "read_error", path: current, error: e.message });
            return;
        }

        for (const entry of entries) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) {
                summary.totalDirs++;
                walk(full, depth + 1);
            } else if (entry.isFile()) {
                summary.totalFiles++;
                let size = 0;
                try {
                    size = fs.statSync(full).size;
                } catch (e) {
                    summary.anomalies.push({ type: "stat_error", path: full, error: e.message });
                }
                summary.totalSize += size;

                const ext = path.extname(entry.name).toLowerCase() || "<none>";
                if (!summary.byExtension[ext]) summary.byExtension[ext] = { count: 0, size: 0 };
                summary.byExtension[ext].count++;
                summary.byExtension[ext].size += size;

                if (size === 0) {
                    summary.anomalies.push({ type: "zero_size", path: full });
                }
            }
        }
    }

    walk(rootDir, 0);
    return summary;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const target = args.path;

    if (!target) {
        console.error("Usage: NexusInspector_VX.exe --path=C:\\CosmoCodeUniverse");
        process.exit(1);
    }

    log("=== NexusInspector VX v1.0 ===");
    log("Dossier cible : " + target);

    if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
        log("❌ Dossier cible invalide.");
        process.exit(1);
    }

    const summary = analyzeDirectory(target, 6);
    const logsDir = path.join(process.cwd(), "logs");
    const mapFile = path.join(logsDir, "nexus_map.json");

    fs.writeFileSync(mapFile, JSON.stringify(summary, null, 2), "utf8");
    log("Carte Nexus générée : " + mapFile);
    log(`Total fichiers: ${summary.totalFiles}, dossiers: ${summary.totalDirs}, taille: ${summary.totalSize} octets`);

    log("NexusInspector VX v1.0 terminé.");
    process.exit(0);
}

main();
