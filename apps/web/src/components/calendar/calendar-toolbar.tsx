import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { CalendarMode } from "@/store/user-preferences";

type CalendarToolbarProps = {
  mode: CalendarMode;
  onModeChange: (mode: CalendarMode) => void;
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onlyMine: { active: boolean; onToggle: () => void } | null;
};

const MODES: CalendarMode[] = ["week", "month"];

export default function CalendarToolbar({
  mode,
  onModeChange,
  label,
  onPrevious,
  onNext,
  onToday,
  onlyMine,
}: CalendarToolbarProps): JSX.Element {
  const { t } = useTranslation();
  const isWeek = mode === "week";

  return (
    <div className="border-b border-border/80 px-3 py-2 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="sr-only">{t("tasks:calendar.title")}</h1>
          <div
            role="group"
            aria-label={t("tasks:calendar.mode.label")}
            className="flex h-7 shrink-0 items-center gap-0.5 rounded-lg border border-border/80 bg-background p-0.5 dark:bg-input/32"
          >
            {MODES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={mode === item}
                onClick={() => onModeChange(item)}
                className={cn(
                  "inline-flex h-6 items-center rounded-[calc(var(--radius-lg)-3px)] px-2.5 font-medium text-[13px] outline-none transition-[color,background-color,scale] duration-100 ease-out focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] motion-reduce:active:scale-100",
                  mode === item
                    ? "bg-accent text-foreground shadow-xs/5"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`tasks:calendar.mode.${item}`)}
              </button>
            ))}
          </div>
          <span
            className="truncate font-semibold text-foreground text-sm tabular-nums"
            data-testid="calendar-month-label"
          >
            {label}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {onlyMine && (
            <Button
              variant={onlyMine.active ? "secondary" : "ghost"}
              size="xs"
              aria-pressed={onlyMine.active}
              className="min-h-11 touch-manipulation sm:min-h-0"
              onClick={onlyMine.onToggle}
            >
              <UserRound aria-hidden="true" />
              {t("tasks:calendar.onlyMine")}
            </Button>
          )}
          <Button
            variant="outline"
            size="icon-xs"
            className="min-h-11 touch-manipulation sm:min-h-0"
            aria-label={t(
              isWeek
                ? "tasks:calendar.previousWeek"
                : "tasks:calendar.previousMonth",
            )}
            onClick={onPrevious}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="xs"
            className="min-h-11 touch-manipulation sm:min-h-0"
            onClick={onToday}
          >
            {t(isWeek ? "tasks:calendar.thisWeek" : "tasks:calendar.today")}
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            className="min-h-11 touch-manipulation sm:min-h-0"
            aria-label={t(
              isWeek ? "tasks:calendar.nextWeek" : "tasks:calendar.nextMonth",
            )}
            onClick={onNext}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
