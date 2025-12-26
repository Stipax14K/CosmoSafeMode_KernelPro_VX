// KernelResilience_VX.js
// v1.0 - Noyau de résilience (journalisation des runs du pipeline VX)

const fs = require("fs");
const path = require("path");

function log(msg) {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    const logFile = path.join(logsDir, "kernelresilience_vx.log");
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
    const phase = args.phase || "unknown";

    const logsDir = path.join(process.cwd(), "logs");
    const historyFile = path.join(logsDir, "kernel_history.json");
    let history = [];

    if (fs.existsSync(historyFile)) {
        try {
            history = JSON.parse(fs.readFileSync(historyFile, "utf8"));
        } catch {
            history = [];
        }
    }

    const entry = {
        phase,
        at: new Date().toISOString(),
    };
    history.push(entry);
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), "utf8");

    log("=== KernelResilience VX v1.0 ===");
    log("Phase : " + phase);
    log("Entrée ajoutée dans kernel_history.json");
    log("KernelResilience VX v1.0 terminé.");
    process.exit(0);
}

main();
