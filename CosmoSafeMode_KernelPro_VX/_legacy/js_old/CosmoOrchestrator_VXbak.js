// CosmoOrchestrator_VX.js
// v1.0 - Pipeline complet : SafeMode → Nexus → Meta → SelfRepair (simulate/apply) → AutoUpdate → Kernel

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function log(msg) {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    const logFile = path.join(logsDir, "orchestrator_vx.log");
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

async function runProcess(exe, args, phase) {
    return new Promise(resolve => {
        log(`→ [${phase}] Lancement : ${exe} ${args.join(" ")}`);

        const child = spawn(exe, args, { stdio: "inherit" });

        child.on("exit", code => {
            log(`← [${phase}] Fin : ${exe} (code=${code})`);
            resolve(code);
        });
    });
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const target = args.path;
    const repairMode = args.repairMode || "simulate"; // simulate | apply

    if (!target) {
        console.error("Usage: CosmoOrchestrator_VX.exe --path=C:\\CosmoCodeUniverse [--repairMode=simulate|apply]");
        process.exit(1);
    }

    log("=== CosmoOrchestrator VX v1.0 ===");
    log("Dossier cible : " + target);
    log("Mode de réparation : " + repairMode);

    // 0) KernelResilience - début
    await runProcess("KernelResilience_VX.exe", ["--phase=start"], "kernel-start");

    // 1) SAFE MODE VX (scan physique)
    const safeArgs = [`--path=${target}`, "--mode=ultra"];
    const safeCode = await runProcess("SafeMode_Watchdog_VX.exe", safeArgs, "safemode");

    if (safeCode !== 0) {
        log("❌ SafeMode VX a échoué. Arrêt du pipeline.");
        await runProcess("KernelResilience_VX.exe", ["--phase=error_safemode"], "kernel-error");
        process.exit(1);
    }

    // 2) NEXUS INSPECTOR VX (analyse structurelle)
    const nexusArgs = [`--path=${target}`];
    const nexusCode = await runProcess("NexusInspector_VX.exe", nexusArgs, "nexus");

    if (nexusCode !== 0) {
        log("❌ NexusInspector VX a échoué. Arrêt du pipeline.");
        await runProcess("KernelResilience_VX.exe", ["--phase=error_nexus"], "kernel-error");
        process.exit(1);
    }

    // 3) META STABILIZER VX (diagnostic)
    const metaArgs = [`--path=${target}`];
    const metaCode = await runProcess("MetaStabilizer_VX.exe", metaArgs, "meta");

    if (metaCode !== 0) {
        log("❌ MetaStabilizer VX a échoué. Arrêt du pipeline.");
        await runProcess("KernelResilience_VX.exe", ["--phase=error_meta"], "kernel-error");
        process.exit(1);
    }

    // 4) SELF REPAIR VX (réparations légères)
    const repairArgs = [`--path=${target}`, `--mode=${repairMode}`];
    const repairCode = await runProcess("SelfRepair_VX.exe", repairArgs, "selfrepair");

    if (repairCode !== 0) {
        log("❌ SelfRepair VX a échoué. Arrêt du pipeline.");
        await runProcess("KernelResilience_VX.exe", ["--phase=error_selfrepair"], "kernel-error");
        process.exit(1);
    }

    // 5) AUTO UPDATE VX
    const updateArgs = [`--path=${target}`];
    const updateCode = await runProcess("AutoUpdate_VX.exe", updateArgs, "autoupdate");

    if (updateCode !== 0) {
        log("❌ AutoUpdate VX a échoué. Arrêt du pipeline.");
        await runProcess("KernelResilience_VX.exe", ["--phase=error_autoupdate"], "kernel-error");
        process.exit(1);
    }

    // 6) KernelResilience - fin
    await runProcess("KernelResilience_VX.exe", ["--phase=finish"], "kernel-finish");

    log("=== Pipeline VX v1.0 terminé ===");
    process.exit(0);
}

main();
