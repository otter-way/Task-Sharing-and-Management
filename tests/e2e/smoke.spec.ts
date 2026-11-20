import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

test("sign up, create a workspace with a starter project, and sign in again", async ({
  page,
  context,
}) => {
  const suffix = randomUUID();
  const email = `browser-${suffix}@example.com`;
  const password = `Browser-test-${suffix}`;
  const workspaceName = `Browser test ${suffix.slice(0, 8)}`;

  // A first visit opens in Turkish, the app's default language; the
  // browser's language is not used.
  await page.goto("/auth/sign-up");
  await page.getByLabel("Ad Soyad", { exact: true }).fill("Browser Tester");
  await page.getByLabel("E-posta", { exact: true }).fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page
    .getByRole("button", { name: "Hesap oluştur", exact: true })
    .click();

  await expect(page).toHaveURL(/\/onboarding$/);
  await page
    .getByLabel("Çalışma alanı adı", { exact: true })
    .fill(workspaceName);
  await page.getByRole("button", { name: "Devam et", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Kimler kullanacak?", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Devam et", exact: true }).click();
  await expect(page.getByLabel("Proje adı", { exact: true })).toHaveValue(
    "İlk projem",
  );
  await page.getByRole("button", { name: "Devam et", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: `${workspaceName} hazır`,
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: `${workspaceName} çalışma alanını aç`,
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(
    /\/dashboard\/workspace\/[^/]+\/project\/[^/]+\/board$/,
  );
  await expect(
    page.getByText("Bu kartı bir sonraki sütuna sürükleyin", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("İlk projem", { exact: true }).first(),
  ).toBeVisible();
  const boardUrl = page.url();

  // A reload proves that the server persisted the workspace and session.
  await page.reload();
  await expect(page).toHaveURL(boardUrl);
  await expect(
    page.getByText(workspaceName, { exact: true }).first(),
  ).toBeVisible();

  await context.clearCookies();
  await page.goto(boardUrl);
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await page.getByLabel("E-posta", { exact: true }).fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await expect(page).toHaveURL(boardUrl);
  await expect(
    page.getByText(workspaceName, { exact: true }).first(),
  ).toBeVisible();
});
