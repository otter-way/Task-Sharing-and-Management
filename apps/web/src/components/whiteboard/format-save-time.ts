// Today's saves show only the clock time; older ones add the date so a stale
// board is obvious.
export function formatSaveTime(date: Date, now: Date, locale: string) {
  const sameDay = date.toDateString() === now.toDateString();
  return new Intl.DateTimeFormat(locale, {
    ...(sameDay ? {} : { day: "numeric", month: "short" }),
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
