import { useQuery } from "@tanstack/react-query";
import {
  getProjectNote,
  listProjectNotes,
} from "@/fetchers/project-note/project-note-api";

// Every key starts with ["project-notes", projectId] so one socket message
// refreshes the list and the open note together.
export const projectNoteKeys = {
  all: (projectId: string) => ["project-notes", projectId] as const,
  list: (projectId: string) => ["project-notes", projectId, "list"] as const,
  note: (projectId: string, noteId: string) =>
    ["project-notes", projectId, "note", noteId] as const,
};

export function useProjectNotes(projectId: string) {
  return useQuery({
    queryKey: projectNoteKeys.list(projectId),
    queryFn: () => listProjectNotes(projectId),
    enabled: !!projectId,
  });
}

// The open editor owns the document; this query seeds it and reports newer
// saves. It refetches on mount and when the socket announces a change.
export function useProjectNote(projectId: string, noteId: string | undefined) {
  return useQuery({
    queryKey: projectNoteKeys.note(projectId, noteId ?? ""),
    queryFn: () => getProjectNote(noteId as string),
    enabled: !!noteId,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
}
