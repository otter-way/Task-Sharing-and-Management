import type { AppLocale } from "@i18n/resources";

// This fork serves a Turkish-speaking team: the interface opens in Turkish
// unless the person picked another language in their settings. The browser
// language is ignored on purpose, so an English browser still gets Turkish.
export const appDefaultLocale: AppLocale = "tr-TR";
