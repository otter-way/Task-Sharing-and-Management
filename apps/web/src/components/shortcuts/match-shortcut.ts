import { matchesSearch } from "@/lib/search-text";

const KEY_ALIASES: Record<string, readonly string[]> = {
  cmd: ["⌘"],
  command: ["⌘"],
  meta: ["⌘"],
  shift: ["⇧", "Shift"],
  alt: ["⌥", "Alt"],
  option: ["⌥"],
  opt: ["⌥"],
  ctrl: ["⌃", "Ctrl"],
  control: ["⌃", "Ctrl"],
  enter: ["↵"],
  return: ["↵"],
  esc: ["Esc"],
  escape: ["Esc"],
  backspace: ["⌫"],
  delete: ["⌫"],
  space: ["Space"],
  up: ["↑"],
  down: ["↓"],
  left: ["←"],
  right: ["→"],
};

export function capMatcher(query: string) {
  const value = query.trim();
  if (!value) return null;
  const aliases = KEY_ALIASES[value.toLowerCase()];
  if (aliases) return (cap: string) => aliases.includes(cap);
  if ([...value].length === 1) {
    return (cap: string) => cap.toLowerCase() === value.toLowerCase();
  }
  return null;
}

export function matchesShortcut(
  label: string,
  caps: string[][][],
  query: string,
) {
  if (!query.trim()) return true;
  if (matchesSearch(label, query)) return true;
  const matchCap = capMatcher(query);
  return Boolean(matchCap && caps.flat(2).some(matchCap));
}
