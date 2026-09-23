import { formatRate } from "@/lib/selectors";

export function VerificationBreakdown({ checked, supported, contradicted, insufficient, unavailable }: {
  checked: number;
  supported: number;
  contradicted: number;
  insufficient: number;
  unavailable: number;
}) {
  if (!checked) return <div className="empty-state"><p>No claims were checked.</p></div>;
  const rows = [
    ["Supported", supported, "positive"],
    ["Contradicted", contradicted, "negative"],
    ["Insufficient evidence", insufficient, "warning"],
    ["Source unavailable", unavailable, "neutral"],
  ] as const;
  return (
    <div className="verification-breakdown">
      {rows.map(([label, value, tone]) => (
        <article key={label} data-tone={tone}>
          <p>{label}</p>
          <strong>{new Intl.NumberFormat("en-US").format(value)}</strong>
          <small>{formatRate(value, checked)} of checked claims</small>
        </article>
      ))}
    </div>
  );
}
