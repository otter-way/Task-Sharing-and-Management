import { matchesSearch } from "@/lib/search-text";

export function filterByName<Item>(
  items: Item[],
  term: string,
  name: (item: Item) => string,
) {
  if (!term.trim()) return items;
  return items.filter((item) => matchesSearch(name(item), term));
}
