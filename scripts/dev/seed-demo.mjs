#!/usr/bin/env node
// Deletes and recreates the demo workspace through the running local API:
// three test users, the "Deneme Ekibi" workspace with the "Yaz Projesi"
// project, fifteen tasks across this week and month, whiteboard notes and a
// weekly meeting note. Run with `pnpm deneme-verisi` while the API is up.
import { randomUUID } from "node:crypto";
import { apiSession } from "./api-session.mjs";
import {
  PROJECT,
  STICKY_NOTES,
  TASKS,
  USERS,
  WORKSPACE_NAME,
  weeklyMeetingNote,
} from "./demo-data.mjs";
import { daysOfWeek, freeDaysOfMonth, toIsoAt } from "./demo-dates.mjs";
import { stickyNote } from "./sticky-note.mjs";

const apiUrl = (process.env.KANEO_API_URL || "http://localhost:1337").replace(
  /\/api\/?$/,
  "",
);
const clientUrl = process.env.KANEO_CLIENT_URL || "http://localhost:5173";

async function signIn(user) {
  const session = apiSession({ apiUrl, clientUrl });
  try {
    await session.post("auth/sign-in/email", {
      email: user.email,
      password: user.password,
    });
  } catch (error) {
    if (error.status !== 401) throw error;
    await session.post("auth/sign-up/email", user);
  }
  // Test users read the app in Turkish, like the team will.
  await session.post("auth/update-user", { locale: "tr-TR" });
  const me = await session.get("auth/get-session");
  return { ...user, session, id: me.user.id };
}

async function removeOldWorkspace(owner) {
  const workspaces = (await owner.session.get("auth/organization/list")) ?? [];
  for (const workspace of workspaces.filter(
    (item) => item.name === WORKSPACE_NAME,
  )) {
    await owner.session.post("auth/organization/delete", {
      organizationId: workspace.id,
    });
  }
}

async function createTeam(owner, members) {
  const workspace = await owner.session.post("auth/organization/create", {
    name: WORKSPACE_NAME,
    slug: `deneme-ekibi-${randomUUID().slice(0, 8)}`,
  });
  for (const member of members) {
    const invitation = await owner.session.post(
      "auth/organization/invite-member",
      {
        email: member.email,
        role: "member",
        organizationId: workspace.id,
      },
    );
    await member.session.post("auth/organization/accept-invitation", {
      invitationId: invitation.id,
    });
  }
  for (const person of [owner, ...members]) {
    await person.session.post("auth/organization/set-active", {
      organizationId: workspace.id,
    });
  }
  return workspace;
}

async function createTasks(owner, projectId, usersByKey) {
  const week = daysOfWeek(new Date());
  const month = freeDaysOfMonth(new Date(), week);
  for (const task of TASKS) {
    const day =
      task.week !== undefined
        ? week[task.week]
        : task.month !== undefined
          ? month[task.month]
          : null;
    const dates = day
      ? {
          dueDate: toIsoAt(day, task.days ? task.days - 1 : 0, 17),
          ...(task.days ? { startDate: toIsoAt(day, 0, 9) } : {}),
        }
      : {};
    await owner.session.post(`task/${projectId}`, {
      title: task.title,
      description: "",
      status: task.status,
      priority: task.priority,
      ...(task.assignee ? { userId: usersByKey[task.assignee].id } : {}),
      ...dates,
    });
  }
}

async function main() {
  const users = [];
  for (const user of USERS) users.push(await signIn(user));
  const usersByKey = Object.fromEntries(users.map((user) => [user.key, user]));
  const [ayse, ...others] = users;

  await removeOldWorkspace(ayse);
  const workspace = await createTeam(ayse, others);
  const project = await ayse.session.post("project", {
    ...PROJECT,
    workspaceId: workspace.id,
  });
  await createTasks(ayse, project.id, usersByKey);

  await ayse.session.put(`project-board/${project.id}`, {
    baseVersion: 0,
    scene: {
      elements: STICKY_NOTES.flatMap((text, index) => stickyNote(text, index)),
      appState: {},
      files: {},
    },
  });
  const today = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
  }).format(new Date());
  await ayse.session.post(
    `project-note/project/${project.id}`,
    weeklyMeetingNote(today),
  );

  console.log(
    `\n"${WORKSPACE_NAME}" / "${PROJECT.name}" hazır: ${TASKS.length} görev, ${STICKY_NOTES.length} yapışkan not, 1 toplantı notu.\n`,
  );
  console.log("Test kullanıcıları (yalnızca bu bilgisayarda):");
  for (const user of USERS)
    console.log(`  ${user.email.padEnd(20)} şifre: ${user.password}`);
  console.log(
    `\nAdres: ${clientUrl}/dashboard/workspace/${workspace.id}/project/${project.id}/calendar\n`,
  );
}

main().catch((error) => {
  if (error.cause?.code === "ECONNREFUSED") {
    console.error(
      `API'ye ulaşılamadı (${apiUrl}). Önce uygulamayı başlatın: pnpm baslat`,
    );
  } else {
    console.error(`Deneme verisi oluşturulamadı: ${error.message}`);
  }
  process.exit(1);
});
