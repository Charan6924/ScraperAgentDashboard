import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const reportUrl = pathToFileURL(path.resolve("submission-report.html")).href;

test("standalone report works directly from one local file", async ({ page }) => {
  const failedResources: string[] = [];
  page.on("requestfailed", (request) => failedResources.push(request.url()));

  await page.goto(reportUrl);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("45 integrations");
  await expect(page.locator("#count")).toHaveText("100 results");

  await page.locator("#build").selectOption("build_now");
  await expect(page.locator("#count")).toHaveText("45 results");
  await page.locator("#app-search").fill("Salesforce");
  await page.getByRole("button", { name: "Salesforce", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Salesforce" })).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("link", { name: /Open source|Salesforce/i }).first()).toHaveAttribute("href", /^https:\/\//);

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  expect(failedResources).toEqual([]);
});
