import { foldSearchText, matchesSearch } from "@/lib/search-text";

// The blocks the notes "/" menu offers, in menu order. Same-group items sit
// together so the menu's group headings stay contiguous.
export const NOTE_SLASH_KEYS = [
  "heading",
  "heading_2",
  "heading_3",
  "bullet_list",
  "check_list",
  "quote",
  "table",
  "image",
] as const;

type SlashItem = { key: string; title: string; aliases?: string[] };

export function noteSlashItems<T extends SlashItem>(items: readonly T[]): T[] {
  return NOTE_SLASH_KEYS.flatMap((key) =>
    items.filter((item) => item.key === key),
  );
}

// Typing "basl" finds "Başlık": titles and aliases are compared with Turkish
// letters folded, the same way the app's search works.
export function filterNoteSlashItems<T extends SlashItem>(
  items: readonly T[],
  query: string,
): T[] {
  const needle = foldSearchText(query);
  if (!needle) return [...items];
  return items.filter((item) =>
    [item.title, ...(item.aliases ?? [])].some((text) =>
      matchesSearch(text, needle),
    ),
  );
}
