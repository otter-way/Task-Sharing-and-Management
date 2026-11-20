import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { getStatusDisplayLabel } from "@/lib/i18n/domain";

const STATUS_DOT: Record<string, string> = {
  "to-do": "bg-slate-500",
  "in-progress": "bg-blue-500",
  "in-review": "bg-amber-500",
  done: "bg-emerald-500",
};

export type CalendarRowTask = {
  id: string;
  title: string;
  number: number | null;
  status: string;
};

// One line per task: status dot, key and title. The dot never carries the
// status alone; it is spelled out for screen readers and in the tooltip.
export function CalendarTaskRowContent({
  task,
  projectSlug,
  isDone,
  showKey = true,
}: {
  task: CalendarRowTask;
  projectSlug: string | undefined;
  isDone: boolean;
  // Day columns are narrow; there the key moves to the tooltip so the title
  // keeps the room.
  showKey?: boolean;
}) {
  const statusLabel = getStatusDisplayLabel(task.status);
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "size-2 shrink-0 rounded-full",
          STATUS_DOT[task.status] ?? "bg-primary/60",
        )}
      />
      <span className="sr-only">{statusLabel}</span>
      {showKey && projectSlug && task.number != null && (
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
          {projectSlug}-{task.number}
        </span>
      )}
      <span
        className={cn(
          "min-w-0 truncate",
          isDone && "text-muted-foreground line-through",
        )}
      >
        {task.title}
      </span>
    </>
  );
}

export function useTaskRowTitle(
  task: CalendarRowTask,
  projectSlug: string | undefined,
) {
  const { t } = useTranslation();
  const key =
    projectSlug && task.number != null
      ? `${projectSlug}-${task.number} · `
      : "";
  return `${key}${task.title} · ${getStatusDisplayLabel(task.status)} — ${t(
    "tasks:calendar.moveHint",
  )}`;
}
