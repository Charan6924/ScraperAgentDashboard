import type { DistributionRow } from "@/lib/selectors";

export function DistributionBar({ rows, denominator, multiSelect = false }: {
  rows: DistributionRow[];
  denominator: number;
  multiSelect?: boolean;
}) {
  const maximum = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="distribution" aria-label="Distribution">
      {rows.map((row) => (
        <div className="distribution__row" key={row.label}>
          <div className="distribution__label">
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
          <div className="distribution__track" aria-hidden="true">
            <span style={{ width: `${(row.value / maximum) * 100}%` }} />
          </div>
          <small>
            {multiSelect ? `${row.value} apps · multi-select` : denominator > 0 ? `${Math.round((row.value / denominator) * 100)}% of reviewed apps` : "No reviewed apps"}
          </small>
        </div>
      ))}
    </div>
  );
}
