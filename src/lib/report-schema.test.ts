import { describe, expect, it } from "vitest";

import { reportSchema } from "./report-schema";

const zeroCounts = {
  build_now: 0,
  conditional: 0,
  blocked: 0,
  unknown: 0,
};

const validFixture = {
  schema_version: 1,
  metadata: {
    generated_at: "2026-09-22T13:00:00Z",
    source_manifest_updated_at: "2026-09-22T12:00:00+00:00",
    run_id: "fixture",
    total_apps: 0,
    completed_apps: 0,
    failed_apps: 0,
    running_apps: 0,
    pending_apps: 0,
    final_ready: false,
  },
  aggregates: {
    category: {},
    authentication: {},
    access_model: {},
    plan: {},
    gates: {},
    interfaces: {},
    strict_mcp: {},
    buildability: zeroCounts,
    blocker: {},
    verification: {
      checked_claims: 0,
      supported_claims: 0,
      contradicted_claims: 0,
      insufficiently_supported_claims: 0,
      unavailable_source_claims: 0,
      missing_findings: 0,
      human_search_claims: 0,
      verified_original_citations: 0,
      unverified_original_citations: 0,
      support_rate: null,
      citation_verification_rate: null,
    },
    corrections: { proposed: 0, applied: 0, rejected: 0, unresolved: 0 },
  },
  apps: [],
};

describe("reportSchema", () => {
  it("accepts an empty partial snapshot", () => {
    expect(() => reportSchema.parse(validFixture)).not.toThrow();
  });

  it("rejects an unknown app status", () => {
    const input = {
      ...validFixture,
      metadata: { ...validFixture.metadata, total_apps: 1, pending_apps: 1 },
      apps: [{
        id: 1,
        slug: "mystery",
        name: "Mystery",
        category: "Other",
        website_hint: "example.com",
        status: "mystery",
        errors: [],
      }],
    };
    expect(() => reportSchema.parse(input)).toThrow();
  });

  it("rejects malformed aggregate counts", () => {
    const input = {
      ...validFixture,
      aggregates: {
        ...validFixture.aggregates,
        buildability: { ...zeroCounts, build_now: "none" },
      },
    };
    expect(() => reportSchema.parse(input)).toThrow();
  });
});
