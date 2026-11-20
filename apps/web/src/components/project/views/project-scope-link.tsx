import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isPlainClick } from "./is-plain-click";
import type { ProjectView } from "./project-views";
import { useProjectViewHref } from "./use-project-view-href";

type ProjectScopeLinkProps = {
  view: ProjectView;
  workspaceId: string;
  projectId: string;
  active: boolean;
  onSelect: (view: ProjectView) => void;
  children: ReactNode;
};

export function ProjectScopeLink({
  view,
  workspaceId,
  projectId,
  active,
  onSelect,
  children,
}: ProjectScopeLinkProps) {
  const href = useProjectViewHref(view, workspaceId, projectId);

  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={(event) => {
        if (!isPlainClick(event)) return;
        event.preventDefault();
        onSelect(view);
      }}
      className={cn(
        // Press feedback matches Button's scale but is shorter: these switch
        // views many times a day, so the cue must not be felt as a delay.
        "inline-flex h-6 items-center rounded-[calc(var(--radius-lg)-3px)] px-2.5 text-[13px] font-medium outline-none transition-[color,background-color,scale] duration-100 ease-out focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] motion-reduce:active:scale-100",
        active
          ? "bg-accent text-foreground shadow-xs/5"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </a>
  );
}
