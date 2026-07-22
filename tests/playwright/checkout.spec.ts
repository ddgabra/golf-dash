import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/round");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole("link", { name: "FairwayServe" })).toBeVisible();
});

test("full guest checkout places order", async ({ page }) => {
  await page.getByRole("link", { name: "Menu" }).click();
  await page.getByLabel("Search catalog").fill("Still Water");
  await page.getByRole("button", { name: "Quick add", exact: true }).click();
  await page.getByRole("link", { name: /Cart \(1\)/ }).click();
  await page.getByRole("button", { name: /Place simulated order/i }).click();
  await expect(page.getByRole("heading", { name: /order-/i }).first()).toBeVisible({
    timeout: 10_000,
  });
});

test("checkout quantity controls update line", async ({ page }) => {
  await page.getByRole("link", { name: "Menu" }).click();
  await page.getByLabel("Search catalog").fill("Still Water");
  await page.getByRole("button", { name: "Quick add", exact: true }).click();
  await page.getByRole("link", { name: /Cart \(1\)/ }).click();
  await page.getByLabel(/Increase Still Water quantity/i).click();
  await expect(page.getByText(/Still Water.*× 2/)).toBeVisible();
});

test("club member can view member account", async ({ page }) => {
  await page.getByLabel("Switch demo role").selectOption("club_member");
  await page.getByRole("link", { name: "Member" }).click();
  await expect(
    page.getByRole("heading", { name: /Club account — Olivia Chen/i }),
  ).toBeVisible();
  await expect(page.getByText(/Monthly requirement/i)).toBeVisible();
});

test("manager can pause alcohol ordering", async ({ page }) => {
  await page.getByLabel("Switch demo role").selectOption("course_manager");
  await page.getByRole("link", { name: "Manager" }).click();
  await page.getByText("Alcohol ordering open").click();
  await page.getByLabel("Switch demo role").selectOption("guest_golfer");
  await page.getByRole("link", { name: "Menu" }).click();
  await page.getByLabel("Search catalog").fill("Prairie Lager");
  await page.getByRole("button", { name: "Quick add", exact: true }).click();
  await page.getByRole("link", { name: /Cart \(1\)/ }).click();
  await expect(
    page.getByRole("button", { name: /Place simulated order/i }),
  ).toBeDisabled();
});
