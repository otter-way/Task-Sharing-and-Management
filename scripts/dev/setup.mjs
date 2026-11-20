#!/usr/bin/env node
// One-time local setup: env files with fresh secrets, the database,
// dependencies, shared packages and database migrations. Safe to run again.
// Usage: pnpm kurulum
import { startDatabase } from "./database.mjs";
import { ensureEnvFile } from "./env-files.mjs";
import { migrateDatabase } from "./migrate.mjs";
import { fail, run } from "./run.mjs";

const root = process.cwd();
const [major, minor] = process.versions.node.split(".").map(Number);
if (!(major >= 26 || (major === 24 && minor >= 15))) {
  fail(
    `Node.js ${process.versions.node} kurulu; 24.15 veya daha yenisi gerekiyor (https://nodejs.org).`,
  );
}

console.log("\n1/5 Ayar dosyaları");
console.log(
  ensureEnvFile(root)
    ? "• .env oluşturuldu (gizli anahtarlar rastgele üretildi, git'e eklenmez)."
    : "• .env zaten var; dokunulmadı.",
);

try {
  console.log("\n2/5 Veritabanı");
  await startDatabase(root);

  console.log("\n3/5 Bağımlılıklar (ilk seferde birkaç dakika sürebilir)");
  await run("pnpm", ["install"]);

  console.log("\n4/5 Paylaşılan paketler");
  await run("pnpm", ["build:dependencies"]);

  console.log("\n5/5 Veritabanı tabloları (migration)");
  await migrateDatabase();

  console.log("\n✔ Kurulum tamam. Uygulamayı başlatmak için: pnpm baslat\n");
} catch (error) {
  fail(error.message);
}
