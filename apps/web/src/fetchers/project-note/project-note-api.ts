import { client } from "@kaneo/libs";
import type { InferRequestType, InferResponseType } from "hono/client";
import { HttpError } from "@/lib/http-error";

const notes = client["project-note"];

async function ok<T extends Response>(response: T) {
  if (!response.ok) throw await HttpError.fromResponse(response);
  return response;
}

export async function listProjectNotes(projectId: string) {
  const response = await ok(
    await notes.project[":projectId"].$get({ param: { projectId } }),
  );
  return (await response.json()) as ProjectNoteSummary[];
}

export async function getProjectNote(id: string) {
  const response = await ok(await notes[":id"].$get({ param: { id } }));
  return (await response.json()) as ProjectNote;
}

export type CreateProjectNoteRequest = InferRequestType<
  (typeof notes)["project"][":projectId"]["$post"]
>["json"];

export async function createProjectNote(
  projectId: string,
  body: CreateProjectNoteRequest,
) {
  const response = await ok(
    await notes.project[":projectId"].$post({
      param: { projectId },
      json: body,
    }),
  );
  return response.json();
}

export type SaveProjectNoteRequest = InferRequestType<
  (typeof notes)[":id"]["$put"]
>["json"];

export async function saveProjectNote(
  id: string,
  body: SaveProjectNoteRequest,
) {
  const response = await ok(
    await notes[":id"].$put({ param: { id }, json: body }),
  );
  return response.json();
}

export async function deleteProjectNote(id: string) {
  const response = await ok(await notes[":id"].$delete({ param: { id } }));
  return response.json();
}

export type ProjectNoteSummary = InferResponseType<
  (typeof notes)["project"][":projectId"]["$get"],
  200
>[number];
export type ProjectNote = InferResponseType<(typeof notes)[":id"]["$get"], 200>;
