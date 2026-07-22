import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/round");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole("link", { name: "FairwayServe" })).toBeVisible();
});

test("round page loads with course content", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: /FairwayServe Demo Club/i }),
  ).toBeVisible();
  await expect(page.getByText("Current hole", { exact: true })).toBeVisible();
});

test("menu page shows products and search", async ({ page }) => {
  await page.getByRole("link", { name: "Menu" }).click();
  await expect(page.getByLabel("Search catalog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Quick add", exact: true }).first(),
  ).toBeVisible();
});

test("guest can add to cart and reach checkout", async ({ page }) => {
  await page.getByRole("link", { name: "Menu" }).click();
  await page.getByLabel("Search catalog").fill("Still Water");
  await page.getByRole("button", { name: "Quick add", exact: true }).click();
  await expect(page.getByRole("link", { name: /Cart \(1\)/ })).toBeVisible();
  await page.getByRole("link", { name: /Cart \(1\)/ }).click();
  await expect(page.getByRole("heading", { name: "Cart items" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Place simulated order/i }),
  ).toBeVisible();
});

test("role switcher changes navigation", async ({ page }) => {
  await page.getByLabel("Switch demo role").selectOption("beverage_cart_staff");
  await expect(page.getByRole("link", { name: "Staff" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Menu" })).not.toBeVisible();
});
