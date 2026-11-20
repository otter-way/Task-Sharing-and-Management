import type { DayPickerLocale } from "react-day-picker";
import { tr } from "react-day-picker/locale";

// Month captions, weekday names and labels of the date picker. Only Turkish is
// mapped; other languages keep the library's English default.
export function getDayPickerLocale(
  language: string,
): DayPickerLocale | undefined {
  return language.toLowerCase().startsWith("tr") ? tr : undefined;
}
