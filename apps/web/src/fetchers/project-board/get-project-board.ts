import { client } from "@kaneo/libs";
import { HttpError } from "@/lib/http-error";

async function getProjectBoard(projectId: string) {
  const response = await client["project-board"][":projectId"].$get({
    param: { projectId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

export type ProjectBoard = Awaited<ReturnType<typeof getProjectBoard>>;

export default getProjectBoard;
