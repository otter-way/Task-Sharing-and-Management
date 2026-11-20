import { spawn, spawnSync } from "node:child_process";
import { isPortOpen, waitFor } from "./run.mjs";

const HEALTH = "http://localhost:1337/api/health";

// The API applies its migrations, and the data fixes around them, when it
// starts. Running it once until it reports healthy is the supported way to
// bring a database up to date; drizzle-kit alone skips those fixes.
export async function migrateDatabase() {
  if (await isPortOpen(1337)) {
    console.log("• API zaten çalışıyor; migration'lar açılışta uygulandı.");
    return;
  }
  const isWindows = process.platform === "win32";
  const api = spawn("pnpm", ["--filter", "@kaneo/api", "dev"], {
    shell: isWindows,
    detached: !isWindows,
    stdio: ["ignore", "ignore", "inherit"],
  });
  const healthy = await waitFor(
    async () => {
      try {
        return (await fetch(HEALTH)).ok;
      } catch {
        return false;
      }
    },
    { timeoutMs: 180_000 },
  );
  try {
    if (isWindows) {
      spawnSync("taskkill", ["/pid", String(api.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      process.kill(-api.pid, "SIGTERM");
    }
  } catch {
    // Already exited; its error, if any, is shown above.
  }
  if (!healthy)
    throw new Error(
      "API açılmadı; migration'lar uygulanamadı. Yukarıdaki hata mesajına bakın.",
    );
  console.log("• Veritabanı tabloları güncel.");
}
