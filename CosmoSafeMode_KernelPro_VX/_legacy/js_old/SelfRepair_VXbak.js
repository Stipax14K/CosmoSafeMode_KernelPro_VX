// SelfRepair_VX.js
// v1.0 - Réparations légères (safe) sur l'univers

const fs = require("fs");
const path = require("path");

function log(msg) {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    const logFile = path.join(logsDir, "selfrepair_vx.log");
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

function isCacheOrTempDir(name) {
    const lower = name.toLowerCase();
    return (
        lower === ".cache" ||
        lower === "cache" ||
        lower === "temp" ||
        lower === "tmp" ||
        lower === "__pycache__" ||
        lower === "node_modules"
    );
}

function shouldTreatAsIndex(fileName) {
    const lower = fileName.toLowerCase();
    return (
        lower === "index.json" ||
        lower === "manifest.json" ||
        lower === "map.json" ||
        lower === "metadata.json"
    );
}

function isInvalidJsonFile(fullPath) {
    try {
        const content = fs.readFileSync(fullPath, "utf8");
        JSON.parse(content);
        return false;
    } catch {
        return true;
    }
}

function selfRepair(rootDir, mode = "simulate") {
    const actions = [];

    function walk(current) {
        let entries;
        try {
            entries = fs.readdirSync(current, { withFileTypes: true });
        } catch (e) {
            log("Erreur lecture dossier : " + current + " (" + e.message + ")");
            return;
        }

        if (entries.length === 0) {
            actions.push({ type: "delete_empty_dir", path: current });
            return;
        }

        for (const entry of entries) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) {
                if (isCacheOrTempDir(entry.name)) {
                    actions.push({ type: "delete_cache_dir", path: full });
                } else {
                    walk(full);
                }
            } else if (entry.isFile()) {
                let stat;
                try {
                    stat = fs.statSync(full);
                } catch (e) {
                    actions.push({ type: "delete_unreadable_file", path: full, reason: e.message });
                    continue;
                }

                if (stat.size === 0) {
                    actions.push({ type: "delete_zero_file", path: full });
                } else if (path.extname(entry.name).toLowerCase() === ".json" && shouldTreatAsIndex(entry.name)) {
                    if (isInvalidJsonFile(full)) {
                        actions.push({ type: "rebuild_index_json", path: full });
                    }
                }
            }
        }
    }

    walk(rootDir);

    log(`Actions détectées : ${actions.length}`);

    if (mode === "simulate") {
        log("Mode simulate : aucune modification réelle.");
    } else if (mode === "apply") {
        for (const act of actions) {
            if (act.type === "delete_cache_dir" || act.type === "delete_empty_dir") {
                try {
                    fs.rmSync(act.path, { recursive: true, force: true });
                    log(`SUPPR DIR : ${act.path}`);
                } catch (e) {
                    log(`ECHEC SUPPR DIR : ${act.path} (${e.message})`);
                }
            } else if (act.type === "delete_zero_file" || act.type === "delete_unreadable_file") {
                try {
                    fs.unlinkSync(act.path);
                    log(`SUPPR FILE : ${act.path}`);
                } catch (e) {
                    log(`ECHEC SUPPR FILE : ${act.path} (${e.message})`);
                }
            } else if (act.type === "rebuild_index_json") {
                try {
                    const content = {
                        rebuilt: true,
                        originalPath: act.path,
                        rebuiltAt: new Date().toISOString(),
                    };
                    fs.writeFileSync(act.path, JSON.stringify(content, null, 2), "utf8");
                    log(`REBUILD JSON : ${act.path}`);
                } catch (e) {
                    log(`ECHEC REBUILD JSON : ${act.path} (${e.message})`);
                }
            }
        }
    }

    return actions;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const target = args.path;
    const mode = args.mode || "simulate";

    if (!target) {
        console.error("Usage: SelfRepair_VX.exe --path=C:\\CosmoCodeUniverse --mode=simulate|apply");
        process.exit(1);
    }

    log("=== SelfRepair VX v1.0 ===");
    log("Dossier cible : " + target);
    log("Mode : " + mode);

    if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
        log("❌ Dossier cible invalide.");
        process.exit(1);
    }

    const actions = selfRepair(target, mode);
    log(`SelfRepair terminé. Actions totales : ${actions.length}`);
    process.exit(0);
}

main();
