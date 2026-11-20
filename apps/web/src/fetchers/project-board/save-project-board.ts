import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";
import { HttpError } from "@/lib/http-error";

export type SaveProjectBoardRequest = InferRequestType<
  (typeof client)["project-board"][":projectId"]["$put"]
>["json"];

async function saveProjectBoard(
  projectId: string,
  body: SaveProjectBoardRequest,
) {
  const response = await client["project-board"][":projectId"].$put({
    param: { projectId },
    json: body,
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

export default saveProjectBoard;
