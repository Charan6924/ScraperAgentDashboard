"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { href: "/", label: "Overview" },
  { href: "/trends", label: "Trends" },
  { href: "/apps", label: "App Explorer" },
  { href: "/verification", label: "Verification" },
  { href: "/methodology", label: "Methodology" },
] as const;

export function SiteHeader({ completedApps, totalApps }: { completedApps: number; totalApps: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header__bar page-frame">
        <Link className="wordmark" href="/" onClick={() => setIsOpen(false)}>
          <span className="wordmark__mark" aria-hidden="true">C</span>
          <span>
            <strong>Integration Index</strong>
            <small>Agent toolkit research</small>
          </span>
        </Link>
        <div className="site-header__meta">
          <span className="coverage-chip">{completedApps} / {totalApps} reviewed</span>
          <button
            className="nav-toggle"
            type="button"
            aria-expanded={isOpen}
            aria-controls="primary-navigation"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setIsOpen((open) => !open)}
          >
            <span aria-hidden="true">{isOpen ? "Close" : "Menu"}</span>
          </button>
        </div>
      </div>
      <div className="site-header__nav-row">
        <nav id="primary-navigation" className="primary-nav page-frame" aria-label="Primary" data-open={isOpen}>
          {navigation.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={() => setIsOpen(false)}>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
