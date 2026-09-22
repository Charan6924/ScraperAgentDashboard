const stages = [
  ["Input", "100 requested apps"],
  ["Pass 1", "Codex researches a structured record"],
  ["Python gate", "Schema and consistency checks"],
  ["Pass 2", "Independent claim verification"],
  ["Correction", "Safe edits or human review"],
] as const;

export function Workflow() {
  return (
    <div className="workflow" role="img" aria-label="Two-pass research workflow">
      {stages.map(([label, detail], index) => (
        <div className="workflow__stage" key={label}>
          <span className="workflow__number">{String(index + 1).padStart(2, "0")}</span>
          <strong>{label}</strong>
          <small>{detail}</small>
        </div>
      ))}
    </div>
  );
}
