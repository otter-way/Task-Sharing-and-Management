// Dates for the demo tasks, in the computer's own time zone, so the calendar
// shows them on the intended days whenever the script runs.

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// Monday to Sunday of the week containing `now` (the app's default week).
export function daysOfWeek(now) {
  const today = startOfDay(now);
  const monday = addDays(today, -((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

// Five days of this month outside this week, spread from its start to end.
export function freeDaysOfMonth(now, week) {
  const weekDays = new Set(week.map((day) => day.getTime()));
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const free = [];
  for (
    let day = first;
    day.getMonth() === now.getMonth();
    day = addDays(day, 1)
  ) {
    if (!weekDays.has(day.getTime())) free.push(day);
  }
  const count = 5;
  return Array.from(
    { length: count },
    (_, index) => free[Math.round((index * (free.length - 1)) / (count - 1))],
  );
}

export function toIsoAt(day, plusDays, hour) {
  const date = addDays(day, plusDays);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}
