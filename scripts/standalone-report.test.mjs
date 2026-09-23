import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { buildStandaloneReport } from "./standalone-report.mjs";

const report = JSON.parse(
  await readFile(new URL("../src/data/report.json", import.meta.url), "utf8"),
);

test("builds one self-contained interactive report from all app records", () => {
  const html = buildStandaloneReport(report);

  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<style>[\s\S]+<\/style>/);
  assert.match(html, /<script>[\s\S]+<\/script>/);
  assert.doesNotMatch(html, /<link\b[^>]*rel=["']stylesheet/i);
  assert.doesNotMatch(html, /<script\b[^>]*\bsrc=/i);
  assert.doesNotMatch(html, /<img\b[^>]*\bsrc=/i);
  assert.match(html, /data-total-apps="100"/);
  assert.match(html, /98 of 100 apps completed/);
  assert.match(html, /Klaviyo/);
  assert.match(html, /fanbasis/);
  assert.match(html, /id="app-search"/);
  assert.match(html, /id="app-dialog"/);
  assert.match(html, /https:\/\/github\.com\/Charan6924\/ScraperAgent/);
});
