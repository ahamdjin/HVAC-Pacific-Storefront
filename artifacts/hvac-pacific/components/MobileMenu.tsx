"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NavItem = { label: string; href: string };

export function MobileMenu({
  menuLabel,
  unitsLabel,
  partsLabel,
  units,
  parts,
  links,
}: {
  menuLabel: string;
  unitsLabel: string;
  partsLabel: string;
  units: NavItem[];
  parts: NavItem[];
  links: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("mobile-menu-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("mobile-menu-open");
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="mobile-menu-root">
      <button
        ref={button}
        type="button"
        className="mobile-menu-button"
        aria-expanded={open}
        aria-controls="mobile-site-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr">{menuLabel}</span>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          {open ? (
            <path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>
      {open && (
        <>
          <button className="mobile-menu-scrim" type="button" aria-label="Close menu" onClick={close} />
          <nav id="mobile-site-menu" className="mobile-menu-panel" aria-label={menuLabel}>
            <details open>
              <summary>{unitsLabel}</summary>
              <div>{units.map((item) => <Link key={item.href} href={item.href} onClick={close}>{item.label}</Link>)}</div>
            </details>
            <details>
              <summary>{partsLabel}</summary>
              <div>{parts.map((item) => <Link key={item.href} href={item.href} onClick={close}>{item.label}</Link>)}</div>
            </details>
            <div className="mobile-menu-primary">
              {links.map((item) => <Link key={item.href} href={item.href} onClick={close}>{item.label}</Link>)}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
