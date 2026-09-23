import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/trends", "/apps", "/verification", "/methodology"];

test("all five report pages are reachable, accessible, and free of runtime failures", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && response.request().resourceType() !== "document") {
      runtimeErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  for (const path of routes) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link")).toHaveCount(5);
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations, `${path} accessibility violations`).toEqual([]);
  }
  expect(runtimeErrors).toEqual([]);
});

test("overview discloses partial coverage and links through the report", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Preliminary snapshot")).toBeVisible();
  await expect(page.getByText(/98 of 100 apps completed/i)).toBeVisible();
  await page.getByRole("link", { name: "Review verification" }).click();
  await expect(page).toHaveURL(/\/verification/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("6,424 claims");
});

test("mobile navigation exposes exactly five destinations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trends");
  const menu = page.getByRole("button", { name: "Open navigation" });
  await expect(menu).toBeVisible();
  await menu.click();
  const navigation = page.getByRole("navigation", { name: "Primary" });
  await expect(navigation.getByRole("link")).toHaveCount(5);
  await expect(navigation.getByRole("link", { name: "Trends" })).toHaveAttribute("aria-current", "page");
  await navigation.getByRole("link", { name: "App Explorer" }).click();
  await expect(page).toHaveURL(/\/apps/);
  await expect(page.getByRole("row", { name: /Attio/ })).toBeVisible();
  const tableWidth = await page.locator(".table-wrap").evaluate((element) => ({ client: element.clientWidth, scroll: element.scrollWidth }));
  expect(tableWidth.scroll).toBeLessThanOrEqual(tableWidth.client);
});

test("explorer combines filters, resets, and renders an empty state", async ({ page }) => {
  await page.goto("/apps");
  await expect(page.getByText("100 results")).toBeVisible();
  await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("complete");
  await page.getByRole("combobox", { name: "Buildability" }).selectOption("build_now");
  await expect(page.getByText("45 results")).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove Status: Complete" })).toBeVisible();
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(page.getByText("100 results")).toBeVisible();
  await page.getByRole("searchbox", { name: "Search apps" }).fill("no-such-product");
  await expect(page.getByText(/No apps match those filters/i)).toBeVisible();
});

test("query selection opens an evidence drawer that closes from the keyboard", async ({ page }) => {
  await page.goto("/apps?app=salesforce");
  const drawer = page.getByRole("dialog", { name: "Salesforce research details" });
  await expect(drawer).toBeVisible();
  const source = drawer.getByRole("link", { name: /Open source/ }).first();
  await expect(source).toHaveAttribute("target", "_blank");
  await expect(source).toHaveAttribute("rel", /noreferrer/);
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(page).toHaveURL(/\/apps$/);
});

test("unknown app query is a safe fallback", async ({ page }) => {
  await page.goto("/apps?app=not-real");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("100 results")).toBeVisible();
});
