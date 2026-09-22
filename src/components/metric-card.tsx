import type { ReactNode } from "react";

type MetricTone = "accent" | "positive" | "warning" | "negative" | "neutral";

export function MetricCard({ label, value, detail, tone = "neutral" }: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: MetricTone;
}) {
  return (
    <article className="metric-card" data-tone={tone}>
      <p className="metric-card__label">{label}</p>
      <p className="metric-card__value">{value}</p>
      {detail ? <p className="metric-card__detail">{detail}</p> : null}
    </article>
  );
}
