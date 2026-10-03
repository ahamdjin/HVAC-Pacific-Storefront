"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

type Item = { label: string; href: string };

export function MegaMenu({
  label,
  allLabel,
  allHref,
  items,
  wide,
}: {
  label: string;
  allLabel: string;
  allHref: string;
  items: Item[];
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="mega"
      onPointerEnter={(event) => event.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setOpen(false)}
    >
      <button
        type="button"
        ref={buttonRef}
        className="nav-link"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className={open ? "flip" : ""}>
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
      {open && (
        <div id={panelId} className={`mega-panel ${wide ? "wide" : ""}`}>
          <ul>
            {items.map((i) => (
              <li key={i.href}>
                <Link href={i.href} onClick={() => setOpen(false)}>
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={allHref} className="mega-all" onClick={() => setOpen(false)}>
            {allLabel} &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
