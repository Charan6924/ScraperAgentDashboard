import type { ReactNode } from "react";

type StatusTone = "positive" | "warning" | "negative" | "neutral";

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: StatusTone }) {
  return <span className="status-badge" data-tone={tone}>{children}</span>;
}
