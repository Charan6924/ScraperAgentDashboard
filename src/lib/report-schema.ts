import { z } from "zod";

const count = z.number().int().nonnegative();
const countMap = z.record(z.string(), count);
const nullableRate = z.number().min(0).max(1).nullable();

export const evidenceSchema = z.object({
  url: z.string().url().startsWith("https://"),
  page_title: z.string().min(1).nullable(),
  excerpt: z.string().min(1),
  retrieved_at: z.string().min(1).nullable(),
}).strict();

const authenticationMethodSchema = z.object({
  method: z.string().min(1),
  setup_steps: z.array(z.string().min(1)),
  scopes: z.array(z.string().min(1)),
  evidence: z.array(evidenceSchema).min(1),
}).strict();

const gateSchema = z.object({
  type: z.enum(["admin_approval", "app_review", "partnership", "contact_sales", "other"]),
  description: z.string().min(1),
  evidence: z.array(evidenceSchema).min(1),
}).strict();

const resourceSchema = z.object({
  name: z.string().min(1),
  actions: z.array(z.string().min(1)),
  evidence: z.array(evidenceSchema).min(1),
}).strict();

const apiSurfaceSchema = z.object({
  name: z.string().min(1),
  interfaces: z.array(z.enum(["REST", "GraphQL", "SOAP", "gRPC", "Webhooks", "SDK", "CLI", "other", "unknown"])).min(1),
  notes: z.string().nullable(),
  resources: z.array(resourceSchema),
  evidence: z.array(evidenceSchema).min(1),
}).strict();

const mcpServerSchema = z.object({
  name: z.string().min(1),
  source: z.enum(["official", "community"]),
  github_url: z.string().url().startsWith("https://github.com/").nullable(),
  docs_url: z.string().url().startsWith("https://").nullable(),
  access_restrictions: z.string().nullable(),
  evidence: z.array(evidenceSchema).min(1),
}).strict();

const appRecordSchema = z.object({
  description: z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    purpose: z.string().min(1),
    evidence: z.array(evidenceSchema).min(1),
  }).strict(),
  authentication: z.object({
    status: z.enum(["documented", "none", "unknown"]),
    methods: z.array(authenticationMethodSchema),
  }).strict(),
  access: z.object({
    model: z.enum(["self_service", "gated", "mixed", "unknown"]),
    plan: z.object({
      value: z.enum(["free_available", "trial_available", "paid_required", "enterprise_required", "other", "unknown"]),
      note: z.string().nullable(),
      evidence: z.array(evidenceSchema),
    }).strict(),
    gates: z.array(gateSchema),
  }).strict(),
  api_surface: z.array(apiSurfaceSchema),
  buildability: z.object({
    assessment: z.enum(["build_now", "conditional", "blocked", "unknown"]),
    evidence: z.array(evidenceSchema).min(1),
  }).strict(),
  blocker: z.object({
    category: z.enum([
      "none", "paid_plan", "enterprise_only", "admin_approval", "app_review",
      "partnership", "contact_sales", "missing_public_api", "limited_api",
      "unclear_documentation", "other",
    ]),
    description: z.string().min(1),
    evidence: z.array(evidenceSchema).min(1),
  }).strict().nullable(),
  mcp: z.object({
    status: z.enum(["official", "community", "none_found", "unknown"]),
    servers: z.array(mcpServerSchema),
  }).strict(),
  verification: z.object({
    status: z.literal("unverified"),
    checked_at: z.null(),
    disagreements: z.array(z.string()),
    corrections: z.array(z.string()),
  }).strict(),
}).strict();

const reviewMetricsSchema = z.object({
  checked_claims: count,
  supported_claims: count,
  contradicted_claims: count,
  insufficiently_supported_claims: count,
  unavailable_source_claims: count,
  missing_findings: count,
  support_rate: nullableRate,
  human_search_claims: count,
  verified_original_citations: count,
  unverified_original_citations: count,
}).strict();

const genericFinding = z.record(z.string(), z.unknown());

const reviewSchema = z.object({
  input_sha256: z.string().min(1),
  checked_at: z.string().min(1),
  verification_method: z.string().min(1),
  source_checks: z.array(genericFinding),
  original_citation_issues: z.array(genericFinding),
  human_search_queue: z.array(genericFinding),
  claims: z.array(genericFinding),
  missing_information: z.array(genericFinding),
  proposed_corrections: z.array(genericFinding),
  correction_summary: z.object({
    corrected_file: z.string().min(1),
    applied: z.array(genericFinding),
    rejected: z.array(genericFinding),
    unresolved: z.array(genericFinding),
  }).strict(),
  searches: z.array(genericFinding),
  independent_buildability: genericFinding,
  metrics: reviewMetricsSchema,
}).strict();

const qualityIssueSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  blocking: z.boolean(),
}).strict();

const baseApp = z.object({
  id: z.number().int().positive(),
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  website_hint: z.string().min(1),
});

const completedAppSchema = baseApp.extend({
  status: z.literal("complete"),
  record: appRecordSchema,
  verification: reviewSchema,
  artifact: z.object({ input_sha256: z.string().min(1) }).strict(),
  derived: z.object({
    authentication_families: z.array(z.string().min(1)),
    interfaces: z.array(z.string().min(1)),
    strict_mcp_status: z.enum(["official", "community", "none_found", "unknown"]),
    strict_mcp_servers: z.array(mcpServerSchema),
    excluded_mcp_servers: z.array(mcpServerSchema.extend({ reason: z.string().min(1) })),
    confidence_band: z.enum(["high", "medium", "low", "unknown"]),
    quality_issues: z.array(qualityIssueSchema),
  }).strict(),
}).strict();

const incompleteAppSchema = baseApp.extend({
  status: z.enum(["failed", "running", "pending"]),
  errors: z.array(z.object({
    stage: z.string().min(1),
    type: z.string().min(1),
    message: z.string().min(1),
    at: z.string().optional(),
    attempt: z.number().int().positive().optional(),
  }).passthrough()),
}).strict();

export const reportSchema = z.object({
  schema_version: z.literal(1),
  metadata: z.object({
    generated_at: z.string().min(1),
    source_manifest_updated_at: z.string().nullable(),
    run_id: z.string().nullable(),
    total_apps: count,
    completed_apps: count,
    failed_apps: count,
    running_apps: count,
    pending_apps: count,
    final_ready: z.boolean(),
  }).strict(),
  aggregates: z.object({
    category: countMap,
    authentication: countMap,
    access_model: countMap,
    plan: countMap,
    gates: countMap,
    interfaces: countMap,
    strict_mcp: countMap,
    buildability: z.object({
      build_now: count,
      conditional: count,
      blocked: count,
      unknown: count,
    }).strict(),
    blocker: countMap,
    verification: z.object({
      checked_claims: count,
      supported_claims: count,
      contradicted_claims: count,
      insufficiently_supported_claims: count,
      unavailable_source_claims: count,
      missing_findings: count,
      human_search_claims: count,
      verified_original_citations: count,
      unverified_original_citations: count,
      support_rate: nullableRate,
      citation_verification_rate: nullableRate,
    }).strict(),
    corrections: z.object({
      proposed: count,
      applied: count,
      rejected: count,
      unresolved: count,
    }).strict(),
  }).strict(),
  apps: z.array(z.union([completedAppSchema, incompleteAppSchema])),
}).strict().superRefine((report, context) => {
  if (report.metadata.total_apps !== report.apps.length) {
    context.addIssue({
      code: "custom",
      path: ["metadata", "total_apps"],
      message: "total_apps must match the app array length",
    });
  }
});

export type Report = z.infer<typeof reportSchema>;
export type ReportApp = Report["apps"][number];
export type CompletedReportApp = Extract<ReportApp, { status: "complete" }>;

export function isCompletedApp(app: ReportApp): app is CompletedReportApp {
  return app.status === "complete";
}
