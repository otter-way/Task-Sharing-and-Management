// Search ignores case and Turkish letter marks, so "isik", "ışık" and "IŞIK"
// all find "Işık", and "gorev" finds "Görev". Plain `toLowerCase()` misses
// these: "I" lowercases to "i" rather than "ı", and "İ" to "i" plus a dot.
// The API folds stored text with the same rule in
// `apps/api/src/search/fold-search-text.ts`; keep the two in step.
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

/** True when `text` contains `query`, ignoring case and Turkish letter marks. */
export function matchesSearch(
  text: string | null | undefined,
  query: string,
): boolean {
  const needle = foldSearchText(query.trim());
  if (!needle) return true;
  return foldSearchText(text ?? "").includes(needle);
}

/** Case-insensitive equality that keeps letter marks ("Işık" ≠ "Isik"). */
export function isSameText(a: string, b: string): boolean {
  return (
    a.normalize("NFC").toLocaleLowerCase("tr-TR") ===
    b.normalize("NFC").toLocaleLowerCase("tr-TR")
  );
}
