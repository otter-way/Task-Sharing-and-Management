import { spawn, spawnSync } from "node:child_process";
import net from "node:net";

const isWindows = process.platform === "win32";

// Runs a command with its output shown; resolves only if it succeeds.
export function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: isWindows,
      ...options,
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(`${command} ${args.join(" ")} (çıkış kodu ${code})`),
          ),
    );
  });
}

// True when the command runs and exits cleanly; output is hidden.
export function succeeds(command, args) {
  const result = spawnSync(command, args, {
    stdio: "ignore",
    shell: isWindows,
  });
  return result.status === 0;
}

export function isPortOpen(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => resolve(false));
  });
}

export async function waitFor(check, { timeoutMs, intervalMs = 1000 }) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    if (await check()) return true;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return false;
}

export function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}
