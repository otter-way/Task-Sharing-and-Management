#!/usr/bin/env node
// Starts the database, the API and the web app in development mode and says
// which address to open. Ctrl+C stops the API and the web app; the database
// keeps running until `pnpm durdur`.
// Usage: pnpm baslat
import { spawn } from "node:child_process";
import { startDatabase } from "./database.mjs";
import { fail, waitFor } from "./run.mjs";

const WEB_URL = "http://localhost:5173";
const API_HEALTH = "http://localhost:1337/api/health";

function startService(label, args) {
  const child = spawn("pnpm", args, {
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  const prefix = (stream, out) =>
    stream.on("data", (chunk) => {
      for (const line of chunk.toString().split(/\r?\n/))
        if (line) out.write(`[${label}] ${line}\n`);
    });
  prefix(child.stdout, process.stdout);
  prefix(child.stderr, process.stderr);
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(
        `\n[${label}] durdu (çıkış kodu ${code}). Yukarıdaki hata mesajına bakın.`,
      );
      process.exit(1);
    }
  });
  return child;
}

const ok = async (url) => {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
};

try {
  await startDatabase(process.cwd());
} catch (error) {
  fail(error.message);
}

const services = [
  startService("api", ["--filter", "@kaneo/api", "dev"]),
  startService("web", ["--filter", "@kaneo/web", "dev"]),
];
const stopAll = () => {
  for (const child of services) child.kill();
  process.exit(0);
};
process.on("SIGINT", stopAll);
process.on("SIGTERM", stopAll);

const ready =
  (await waitFor(() => ok(API_HEALTH), { timeoutMs: 120_000 })) &&
  (await waitFor(() => ok(WEB_URL), { timeoutMs: 60_000 }));
if (!ready)
  fail(
    "Uygulama 3 dakikada açılmadı. [api] ve [web] satırlarındaki hatalara bakın.",
  );

console.log(`\n✔ Uygulama hazır. Tarayıcıda açın: ${WEB_URL}`);
console.log("  Deneme verisi için başka bir terminalde: pnpm deneme-verisi");
console.log("  Durdurmak için bu pencerede Ctrl+C, ardından: pnpm durdur\n");
