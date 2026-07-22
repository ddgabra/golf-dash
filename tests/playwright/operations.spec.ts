import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/round");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("orders page shows placed order after checkout", async ({ page }) => {
  await page.getByRole("link", { name: "Menu" }).click();
  await page.getByLabel("Search catalog").fill("Still Water");
  await page.getByRole("button", { name: "Quick add", exact: true }).click();
  await page.getByRole("link", { name: /Cart \(1\)/ }).click();
  await page.getByRole("button", { name: /Place simulated order/i }).click();
  await expect(page.getByRole("heading", { name: /order-/i }).first()).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByText(/submitted|assigned|new/i).first()).toBeVisible();
});

test("kitchen display loads for kitchen employee", async ({ page }) => {
  await page.getByLabel("Switch demo role").selectOption("kitchen_employee");
  await page.getByRole("link", { name: "Kitchen" }).click();
  await expect(page.getByRole("heading", { name: "new", exact: true })).toBeVisible();
});

test("demo control centre loads for platform admin", async ({ page }) => {
  await page.getByLabel("Switch demo role").selectOption("platform_admin");
  await page.getByRole("link", { name: "Demo" }).click();
  await expect(page.getByRole("heading", { name: "Simulation tools" })).toBeVisible();
});
