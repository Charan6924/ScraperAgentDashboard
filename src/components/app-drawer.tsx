"use client";

import { useEffect, useRef } from "react";

import type { ReportApp } from "@/lib/report-schema";
import { isCompletedApp } from "@/lib/report-schema";
import { humanizeKey } from "@/lib/selectors";
import { EvidenceList } from "./evidence-list";
import { StatusBadge } from "./status-badge";

export function AppDrawer({ app, onClose }: { app: ReportApp; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);

  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="app-drawer" role="dialog" aria-modal="true" aria-label={`${app.name} research details`} onKeyDown={(event) => event.key === "Escape" && onClose()}>
        <div className="app-drawer__header">
          <div><p className="eyebrow">{app.category}</p><h2>{app.name}</h2></div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close details">Close</button>
        </div>
        {!isCompletedApp(app) ? (
          <section><StatusBadge tone="negative">{humanizeKey(app.status)}</StatusBadge><p>This app did not complete the two-pass research workflow.</p>{app.errors.map((error, index) => <p key={index}>{error.stage}: {error.message}</p>)}</section>
        ) : (
          <div className="drawer-sections">
            <section><h3>Purpose</h3><p>{app.record.description.purpose}</p><EvidenceList evidence={app.record.description.evidence} /></section>
            <section><h3>Authentication</h3>{app.record.authentication.methods.length ? app.record.authentication.methods.map((method, index) => <article className="detail-card" key={`${method.method}-${index}`}><h4>{method.method}</h4><p><strong>Setup:</strong> {method.setup_steps.join(" → ")}</p><p><strong>Scopes:</strong> {method.scopes.join(", ") || "No fixed scopes established"}</p><EvidenceList evidence={method.evidence} /></article>) : <p>{humanizeKey(app.record.authentication.status)}</p>}</section>
            <section><h3>Access</h3><p><StatusBadge>{humanizeKey(app.record.access.model)}</StatusBadge> Plan: {humanizeKey(app.record.access.plan.value)}</p>{app.record.access.plan.note ? <p>{app.record.access.plan.note}</p> : null}<EvidenceList evidence={app.record.access.plan.evidence} />{app.record.access.gates.map((gate, index) => <article className="detail-card" key={`${gate.type}-${index}`}><h4>{humanizeKey(gate.type)}</h4><p>{gate.description}</p><EvidenceList evidence={gate.evidence} /></article>)}</section>
            <section><h3>API surface</h3>{app.record.api_surface.map((surface, index) => <article className="detail-card" key={`${surface.name}-${index}`}><h4>{surface.name}</h4><p><strong>Interfaces:</strong> {surface.interfaces.join(", ")}</p>{surface.notes ? <p>{surface.notes}</p> : null}{surface.resources.map((resource, resourceIndex) => <div key={`${resource.name}-${resourceIndex}`}><strong>{resource.name}</strong><p>{resource.actions.join(", ")}</p></div>)}<EvidenceList evidence={surface.evidence} /></article>)}</section>
            <section><h3>MCP</h3><p><StatusBadge>{humanizeKey(app.derived.strict_mcp_status)}</StatusBadge></p>{app.derived.strict_mcp_servers.map((server, index) => <article className="detail-card" key={`${server.name}-${index}`}><h4>{server.name}</h4><p>{humanizeKey(server.source)}{server.access_restrictions ? ` · ${server.access_restrictions}` : ""}</p><EvidenceList evidence={server.evidence} /></article>)}{app.derived.excluded_mcp_servers.length ? <details><summary>{app.derived.excluded_mcp_servers.length} raw MCP claim(s) excluded</summary>{app.derived.excluded_mcp_servers.map((server, index) => <p key={`${server.name}-${index}`}>{server.name}: {server.reason}</p>)}</details> : null}</section>
            <section><h3>Buildability</h3><p><StatusBadge>{humanizeKey(app.record.buildability.assessment)}</StatusBadge></p><EvidenceList evidence={app.record.buildability.evidence} />{app.record.blocker ? <div className="detail-card"><h4>Blocker · {humanizeKey(app.record.blocker.category)}</h4><p>{app.record.blocker.description}</p><EvidenceList evidence={app.record.blocker.evidence} /></div> : null}</section>
            <section><h3>Verification</h3><div className="detail-stats"><span><strong>{app.verification.metrics.checked_claims}</strong> claims checked</span><span><strong>{app.verification.metrics.supported_claims}</strong> supported</span><span><strong>{app.derived.confidence_band}</strong> confidence</span></div><p>{app.verification.metrics.verified_original_citations} original citations verified; {app.verification.metrics.unverified_original_citations} unverified.</p></section>
            <section><h3>Corrections and quality</h3><p>{app.verification.correction_summary.applied.length} applied · {app.verification.correction_summary.rejected.length} rejected · {app.verification.correction_summary.unresolved.length} unresolved</p>{app.derived.quality_issues.length ? <ul>{app.derived.quality_issues.map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.message}</li>)}</ul> : <p>No exporter quality issues recorded.</p>}</section>
          </div>
        )}
      </aside>
    </div>
  );
}
