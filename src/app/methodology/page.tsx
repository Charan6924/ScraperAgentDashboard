import type { Metadata } from "next";

import { Disclosure } from "@/components/disclosure";
import { MethodStep } from "@/components/method-step";
import { PageIntro } from "@/components/page-intro";
import { getReport } from "@/lib/report";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How the Codex research agent, Python quality gates, independent verifier, correction layer, and batch runner produced this report.",
};

const sourceUrl = "https://github.com/Charan6924/ScraperAgent";

export default function MethodologyPage() {
  const report = getReport();
  const researchDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(report.metadata.generated_at));
  const deploymentUrl = process.env.NEXT_PUBLIC_SITE_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null);
  return (
    <div className="report-page methodology-page">
      <PageIntro eyebrow="How it was built" title="Two research passes, deterministic gates, and an explicit human boundary." summary="The pipeline uses Codex CLI web search for research and verification, Python for contracts and orchestration, and a constrained correction layer that preserves the audit trail." />

      <section className="method-list" aria-label="Research workflow">
        <MethodStep number="01" title="Pass 1 research"><p><code>ResearchAgent</code> injects one company, the research policy, and the exact JSON Schema into <code>codex --search exec</code> using <code>gpt-5.6-luna</code> in a read-only sandbox. The output records authentication, access, API surface, strict MCP inputs, buildability, blockers, and claim-level evidence.</p></MethodStep>
        <MethodStep number="02" title="Mechanical Python verification"><p>Before another model is called, Pydantic and Python enforce required fields, enums, HTTPS URLs, timestamps, MCP invariants, verification defaults, and duplicate-free arrays. Malformed records stop here.</p></MethodStep>
        <MethodStep number="03" title="Pass 2 verification"><p>The verifier decomposes the record into stable claim paths, performs independent LLM web search, checks whether excerpts and sources support each claim, searches for omissions, recalculates buildability, and reports support, contradiction, insufficiency, or unavailable-source outcomes.</p></MethodStep>
        <MethodStep number="04" title="Safe correction"><p>The first-pass record is never overwritten. Accepted corrections are written to a separate corrected draft only when the verifier supplies a safe, schema-valid replacement. Rejected and unresolved proposals remain visible in the review.</p></MethodStep>
        <MethodStep number="05" title="Human review"><p>Humans resolve unavailable pages, insufficient evidence, ambiguity, rejected corrections, and any proposed judgment that cannot be safely automated. Corrected records remain drafts; the website does not claim human verification that has not happened.</p></MethodStep>
        <MethodStep number="06" title="Batch orchestration and recovery"><p>The runner uses bounded concurrency, isolated staging directories, retries, stage timeouts, and atomic promotion. On resume it resets stale running stages, validates reusable artifacts, skips completed work, and continues only the remainder.</p></MethodStep>
      </section>

      <section className="section-block" aria-labelledby="reproduce-heading">
        <div className="section-heading"><p className="eyebrow">Run it yourself</p><h2 id="reproduce-heading">Reproduce the research and snapshot.</h2></div>
        <div className="command-stack">
          <pre><code>uv venv --python 3.12</code></pre>
          <pre><code>uv pip install --python .venv/bin/python &quot;pydantic&gt;=2,&lt;3&quot;</code></pre>
          <pre><code>codex login</code></pre>
          <pre><code>.venv/bin/python batch_runner.py</code></pre>
          <pre><code>.venv/bin/python report_exporter.py --output /Users/charan/Documents/ScraperAgentDashboard/src/data/report.json --allow-incomplete</code></pre>
          <pre><code>cd /Users/charan/Documents/ScraperAgentDashboard &amp;&amp; npm install &amp;&amp; npm run build</code></pre>
        </div>
      </section>

      <section className="section-block" aria-labelledby="limitations-heading">
        <div className="section-heading"><p className="eyebrow">Scope and honesty</p><h2 id="limitations-heading">Limitations</h2></div>
        <ul className="limitations-list">
          <li>The snapshot was generated on {researchDate}; vendor documentation, pricing, scopes, and approval policies can change.</li>
          <li>{report.metadata.completed_apps} of {report.metadata.total_apps} apps completed both passes. Failed records are disclosed and excluded from completed-app denominators.</li>
          <li>Evidence support is not ground-truth accuracy, and automated access cannot resolve every login wall, unavailable page, or product ambiguity.</li>
          <li>Strict MCP counts follow this project&apos;s chosen rule: a GitHub repository, usable documentation, and direct evidence of Model Context Protocol.</li>
          <li>The research did not require purchasing plans or completing partner approval, so production-readiness judgments stop at documented prerequisites.</li>
        </ul>
        <Disclosure title="Research date"><p>{researchDate}. Use the linked evidence and rerun the pipeline before making a current integration decision.</p></Disclosure>
      </section>

      <section className="project-links" id="deployment" aria-label="Project links">
        <a href={sourceUrl}>Source repository</a>
        {deploymentUrl ? <a href={deploymentUrl}>Live deployment</a> : <span>Live deployment pending Vercel import</span>}
      </section>
    </div>
  );
}
