import { useSyncExternalStore } from "react";

// ThemeProvider resolves "system" and writes the result as a class on <html>,
// so reading the class follows every theme source, OS changes included.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useDocumentTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => "light" as const);
}
