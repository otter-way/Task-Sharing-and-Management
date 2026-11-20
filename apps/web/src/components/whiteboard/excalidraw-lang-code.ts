// Excalidraw names English "en" and every other language like the app does
// ("tr-TR"); an unknown code falls back to English inside the editor.
export function excalidrawLangCode(language: string) {
  return language.toLowerCase().startsWith("en") ? "en" : language;
}
