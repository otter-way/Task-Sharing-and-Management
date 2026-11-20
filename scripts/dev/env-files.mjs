import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// Creates `.env` from .env.sample when it is missing, never overwriting it.
// The file is git-ignored; its secrets are random and never printed. There is
// deliberately no `.env.local`: the API's env loader reads that file instead
// of `.env` when both exist.

function setLine(text, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^#?\\s*${key}=.*$`, "m");
  return pattern.test(text)
    ? text.replace(pattern, line)
    : `${text.trimEnd()}\n${line}\n`;
}

export function ensureEnvFile(root) {
  const envPath = path.join(root, ".env");
  if (existsSync(envPath)) return false;
  const password = randomBytes(18).toString("hex");
  let text = readFileSync(path.join(root, ".env.sample"), "utf8");
  text = setLine(text, "KANEO_CLIENT_URL", "http://localhost:5173");
  text = setLine(text, "KANEO_API_URL", "http://localhost:1337");
  text = setLine(text, "POSTGRES_PASSWORD", password);
  text = setLine(
    text,
    "DATABASE_URL",
    `postgresql://kaneo:${password}@localhost:5432/kaneo`,
  );
  text = setLine(text, "AUTH_SECRET", randomBytes(32).toString("hex"));
  writeFileSync(envPath, text, { mode: 0o600 });
  return true;
}

// The database user, password and name the API will connect with.
export function readDatabaseSettings(root) {
  const text = readFileSync(path.join(root, ".env"), "utf8");
  const match =
    /^DATABASE_URL=postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/(\S+)$/m.exec(
      text,
    );
  if (!match)
    throw new Error(".env içinde DATABASE_URL bulunamadı veya okunamadı.");
  const [, user, password, host, port, database] = match;
  return { user, password, host, port: Number(port || 5432), database };
}
