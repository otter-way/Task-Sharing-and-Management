import { toUpperText } from "@/lib/text-case";

// Uppercase before selecting characters: some characters expand when
// uppercased ("ß" -> "SS"), so uppercasing afterwards could yield more
// than two characters.
export function getInitials(value: string | null | undefined, fallback = "??") {
  const parts = value?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (parts.length === 0) {
    return toUpperText(Array.from(fallback).slice(0, 2).join(""));
  }

  if (parts.length === 1) {
    return Array.from(toUpperText(parts[0])).slice(0, 2).join("");
  }

  return parts
    .slice(0, 2)
    .map((part) => Array.from(toUpperText(part))[0])
    .join("");
}
