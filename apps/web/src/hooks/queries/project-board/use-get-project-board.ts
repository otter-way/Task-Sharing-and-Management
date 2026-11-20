import { useQuery } from "@tanstack/react-query";
import getProjectBoard from "@/fetchers/project-board/get-project-board";

export function projectBoardQueryKey(projectId: string) {
  return ["project-board", projectId] as const;
}

// The open canvas owns the scene; this query only seeds it and reports newer
// saves. A refetch happens on mount and when the project socket announces a
// save from someone else, never on focus.
export function useGetProjectBoard(projectId: string) {
  return useQuery({
    queryKey: projectBoardQueryKey(projectId),
    queryFn: () => getProjectBoard(projectId),
    enabled: !!projectId,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
