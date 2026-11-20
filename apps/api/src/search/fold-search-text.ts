import { type SQL, type SQLWrapper, sql } from "drizzle-orm";

// Search ignores case and Turkish letter marks, so "isik", "ışık" and "IŞIK"
// all find "Işık", and "gorev" finds "Görev". Plain `lower()`/`ILIKE` miss
// these: "I" lowercases to "i" rather than "ı". The web app folds text with
// the same rule in `apps/web/src/lib/search-text.ts`; keep the two in step.
const FOLD_FROM = "ıİçğöşüâîû";
const FOLD_TO = "iicgosuaiu";

const FOLDED_LETTER = new Map(
  Array.from(FOLD_FROM, (letter, index) => [letter, FOLD_TO[index]]),
);
const FOLDABLE = new RegExp(`[${FOLD_FROM}]`, "g");

export function foldSearchText(value: string): string {
  return value
    .normalize("NFC")
    .toLocaleLowerCase("tr-TR")
    .replace(FOLDABLE, (letter) => FOLDED_LETTER.get(letter) ?? letter);
}

export function foldedText(value: SQLWrapper): SQL {
  return sql`translate(lower(${value}), ${FOLD_FROM}, ${FOLD_TO})`;
}

/** `pattern` must already be folded with `foldSearchText`. */
export function foldedLike(value: SQLWrapper, pattern: string): SQL {
  return sql`${foldedText(value)} LIKE ${pattern}`;
}
