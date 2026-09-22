import type { ReactNode } from "react";

export function Disclosure({ title, children, tone = "info" }: {
  title: string;
  children: ReactNode;
  tone?: "info" | "warning" | "danger";
}) {
  return (
    <aside className="disclosure" data-tone={tone}>
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  );
}
