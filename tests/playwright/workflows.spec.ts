import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/round");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole("link", { name: "FairwayServe" })).toBeVisible();
});

test("product detail page supports customization", async ({ page }) => {
  await page.getByRole("link", { name: "Menu" }).click();
  await page.getByLabel("Search catalog").fill("Bagel Sandwich");
  await page.getByRole("link", { name: "Bagel Sandwich" }).click();
  await expect(page.getByRole("heading", { name: "Bagel Sandwich" })).toBeVisible();
  await page.getByLabel("Required selection *").selectOption({ index: 1 });
  await page.getByLabel("Increase quantity").click();
  await page.getByRole("button", { name: /Add 2 to order/i }).click();
  await expect(page.getByRole("link", { name: /Cart \(1\)/ })).toBeVisible();
});

test("runner role sees staff tasks", async ({ page }) => {
  await page.getByLabel("Switch demo role").selectOption("runner");
  await page.getByRole("link", { name: "Staff" }).click();
  await expect(page.getByRole("heading", { name: "Runner shift" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start runner shift" })).toBeVisible();
});

test("meeting point is not overwritten when changing hole", async ({ page }) => {
  await page.getByText("Round setup options").click();
  await page.getByLabel("Meeting point").selectOption("mp-10");
  await expect(page.getByLabel("Meeting point")).toHaveValue("mp-10");
  await page.getByLabel("Current hole").selectOption("5");
  await expect(page.getByLabel("Meeting point")).toHaveValue("mp-10");
});
