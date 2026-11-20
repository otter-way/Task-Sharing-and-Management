import { createContext, useContext } from "react";

// The task whose lifted copy is landing after a drop. Its row stays ghosted,
// as it was while dragged, until the copy reaches it.
export const CalendarLandingContext = createContext<string | null>(null);

export function useIsLanding(taskId: string) {
  return useContext(CalendarLandingContext) === taskId;
}
