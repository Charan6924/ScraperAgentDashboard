import type { ReactNode } from "react";

export function MethodStep({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <article className="method-step">
      <span>{number}</span>
      <div><h2>{title}</h2>{children}</div>
    </article>
  );
}
