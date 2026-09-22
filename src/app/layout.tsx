import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getReport } from "@/lib/report";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Integration Index — Agent Toolkit Research",
    template: "%s — Integration Index",
  },
  description: "Evidence-led research into API access, authentication, MCP availability, and agent-toolkit buildability across 100 requested applications.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const report = getReport();
  const { completed_apps, total_apps, generated_at } = report.metadata;

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader completedApps={completed_apps} totalApps={total_apps} />
        <main id="main-content" className="page-frame site-main">{children}</main>
        <SiteFooter generatedAt={generated_at} completedApps={completed_apps} totalApps={total_apps} />
      </body>
    </html>
  );
}
