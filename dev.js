const { spawn, execSync } = require("child_process");
const path = require("path");

let backendProcess = null;
let frontendProcess = null;

// Clean up existing processes running on ports 8000 and 3000 to prevent EADDRINUSE errors
function cleanPorts() {
  console.log("\x1b[36m%s\x1b[0m", "[Orchestrator] Pre-checking port 3000 and 8000...");
  try {
    execSync("kill -9 $(lsof -t -i:3000) 2>/dev/null || true");
    execSync("kill -9 $(lsof -t -i:8000) 2>/dev/null || true");
  } catch (err) {
    // ignore errors during cleanup
  }
}

function log(prefix, data, isError = false) {
  const lines = data.toString().split("\n");
  lines.forEach((line) => {
    if (line.trim()) {
      const timestamp = new Date().toLocaleTimeString();
      const output = `[${timestamp}] ${prefix} ${line}`;
      if (isError) {
        console.error(output);
      } else {
        console.log(output);
      }
    }
  });
}

function startBackend() {
  console.log("\x1b[36m%s\x1b[0m", "[Orchestrator] Launching FastAPI backend (port 8000)...");
  
  // uvicorn main:app --port 8000 in python virtualenv
  const uvicornPath = path.join(__dirname, "backend", "venv", "bin", "uvicorn");
  
  backendProcess = spawn(uvicornPath, ["main:app", "--port", "8000"], {
    cwd: path.join(__dirname, "backend"),
    shell: true,
  });

  backendProcess.stdout.on("data", (data) => {
    log("\x1b[32m[Backend]\x1b[0m", data);
  });

  backendProcess.stderr.on("data", (data) => {
    log("\x1b[32m[Backend]\x1b[0m", data, true);
  });

  backendProcess.on("close", (code) => {
    console.log(`[Orchestrator] Backend process exited with code ${code}`);
  });
}

function startFrontend() {
  console.log("\x1b[36m%s\x1b[0m", "[Orchestrator] Launching Next.js frontend (port 3000)...");

  frontendProcess = spawn("npm", ["run", "dev"], {
    cwd: path.join(__dirname, "frontend"),
    shell: true,
  });

  frontendProcess.stdout.on("data", (data) => {
    log("\x1b[34m[Frontend]\x1b[0m", data);
  });

  frontendProcess.stderr.on("data", (data) => {
    log("\x1b[34m[Frontend]\x1b[0m", data, true);
  });

  frontendProcess.on("close", (code) => {
    console.log(`[Orchestrator] Frontend process exited with code ${code}`);
  });
}

// Clean ports before starting services
cleanPorts();

// Start both services
startBackend();
startFrontend();

// Handle graceful termination
function cleanup() {
  console.log("\n\x1b[31m%s\x1b[0m", "[Orchestrator] Shutting down full stack application...");
  
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (e) {
      // Ignored
    }
  }
  
  if (frontendProcess) {
    try {
      frontendProcess.kill();
    } catch (e) {
      // Ignored
    }
  }

  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("SIGUSR2", cleanup); // Support nodemon restarts
process.on("exit", cleanup);
