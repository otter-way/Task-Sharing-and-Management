#!/usr/bin/env node
// Stops the local PostgreSQL container. Data stays in its Docker volume and
// is there again after `pnpm baslat`.
// Usage: pnpm durdur
import { stopDatabase } from "./database.mjs";
import { fail } from "./run.mjs";

try {
  const stopped = await stopDatabase();
  console.log(
    stopped
      ? "✔ Veritabanı durduruldu. Verileriniz korunuyor; tekrar başlatmak için: pnpm baslat"
      : "• Durdurulacak bir veritabanı konteyneri yok.",
  );
} catch (error) {
  fail(error.message);
}
