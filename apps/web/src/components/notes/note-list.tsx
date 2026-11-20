import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { formatSaveTime } from "@/components/common/autosave/format-save-time";
import type { ProjectNoteSummary } from "@/fetchers/project-note/project-note-api";
import { cn } from "@/lib/cn";

type NoteListProps = {
  notes: ProjectNoteSummary[];
  activeId: string | undefined;
};

export function NoteList({ notes, activeId }: NoteListProps) {
  const { t, i18n } = useTranslation();
  const now = new Date();

  return (
    <nav aria-label={t("notes:title")}>
      <ul className="flex flex-col gap-0.5">
        {notes.map((note) => (
          <li key={note.id}>
            <Link
              to="."
              search={{ noteId: note.id }}
              aria-current={note.id === activeId ? "page" : undefined}
              className={cn(
                "flex flex-col gap-0.5 rounded-lg px-2.5 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                note.id === activeId
                  ? "bg-accent text-foreground"
                  : "text-foreground/90 hover:bg-accent/60",
              )}
            >
              <span className="truncate font-medium text-sm">
                {note.title || t("notes:untitled")}
              </span>
              <span className="truncate text-muted-foreground text-xs tabular-nums">
                {[
                  note.updatedBy?.name,
                  formatSaveTime(new Date(note.updatedAt), now, i18n.language),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
