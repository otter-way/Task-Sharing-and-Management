import { readDatabaseSettings } from "./env-files.mjs";
import { fail, isPortOpen, run, succeeds, waitFor } from "./run.mjs";

// The local PostgreSQL runs in one named container whose data lives in a
// named volume, so stopping or restarting it keeps everything. Its user and
// password come from DATABASE_URL in .env.
const CONTAINER = "ekip-gorev-postgres";
const VOLUME = "ekip-gorev-postgres-data";
const IMAGE = "postgres:16-alpine";

const containerExists = () =>
  succeeds("docker", ["container", "inspect", CONTAINER]);
const containerRunning = () => succeeds("docker", ["exec", CONTAINER, "true"]);

export async function startDatabase(root) {
  const settings = readDatabaseSettings(root);
  const dockerUp = succeeds("docker", ["info"]);

  if (!(dockerUp && containerRunning()) && (await isPortOpen(settings.port))) {
    console.log(
      `• ${settings.port} portunda zaten bir PostgreSQL çalışıyor; o kullanılacak.`,
    );
    return;
  }
  if (!dockerUp) {
    fail(
      "Docker çalışmıyor. Docker Desktop'ı açın, hazır olduğunda komutu yeniden çalıştırın.",
    );
  }

  if (!containerExists()) {
    console.log("• Veritabanı ilk kez oluşturuluyor (PostgreSQL 16)…");
    await run("docker", [
      "run",
      "-d",
      "--name",
      CONTAINER,
      "-p",
      `127.0.0.1:${settings.port}:5432`,
      "-e",
      `POSTGRES_USER=${settings.user}`,
      "-e",
      `POSTGRES_PASSWORD=${settings.password}`,
      "-e",
      `POSTGRES_DB=${settings.database}`,
      "-v",
      `${VOLUME}:/var/lib/postgresql/data`,
      IMAGE,
    ]);
  } else if (!containerRunning()) {
    console.log("• Veritabanı başlatılıyor…");
    await run("docker", ["start", CONTAINER]);
  }

  const ready = await waitFor(
    () =>
      succeeds("docker", [
        "exec",
        CONTAINER,
        "pg_isready",
        "-U",
        settings.user,
        "-d",
        settings.database,
      ]),
    { timeoutMs: 60_000 },
  );
  if (!ready)
    fail(
      `Veritabanı 60 saniyede hazır olmadı. Ayrıntı için: docker logs ${CONTAINER}`,
    );
  console.log("• Veritabanı hazır.");
}

export async function stopDatabase() {
  if (!succeeds("docker", ["info"]) || !containerExists()) return false;
  await run("docker", ["stop", CONTAINER]);
  return true;
}
