import { expect, test } from "@playwright/test";

test("opens a sample, scans the registry, and adds a package to the plan", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await page.getByRole("button", { name: "Open sample" }).first().click({ timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "uplift-next-app" })).toBeVisible();
  await expect(page.getByText(/^\d+ packages$/)).toBeVisible();

  await page.getByLabel("Filter packages").fill("zod");
  const row = page.getByRole("row", { name: /zod/ });
  const add = row.getByRole("button", { name: "Add" });
  await expect(add).toBeEnabled({ timeout: 30_000 });
  await add.click();

  await expect(page.getByRole("heading", { name: "Upgrade plan" })).toBeVisible();
  await expect(page.getByText("zod").first()).toBeVisible();
});
