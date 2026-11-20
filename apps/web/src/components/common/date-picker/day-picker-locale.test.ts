import { tr } from "react-day-picker/locale";
import { describe, expect, it } from "vite-plus/test";
import { getDayPickerLocale } from "./day-picker-locale";

describe("getDayPickerLocale", () => {
  it("uses the Turkish locale for Turkish", () => {
    expect(getDayPickerLocale("tr-TR")).toBe(tr);
    expect(tr.options?.weekStartsOn).toBe(1);
  });

  it("keeps the library default for other languages", () => {
    expect(getDayPickerLocale("en-US")).toBeUndefined();
  });
});
