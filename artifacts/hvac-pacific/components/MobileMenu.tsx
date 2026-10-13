"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { createPortal } from "react-dom";
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
  const locale = useLocale();
  const pathname = usePathname() || "/";
  const englishPath = pathname === "/zh" ? "/" : pathname.replace(/^\/zh(?=\/)/, "");
  const chinesePath = englishPath === "/" ? "/zh" : `/zh${englishPath}`;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterFrame = useRef<number | null>(null);
  const button = useRef<HTMLButtonElement>(null);

  // A drawer opened on mobile must not linger when the viewport becomes desktop.
  useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 900px)");
    const onViewportChange = () => {
      if (!mobileViewport.matches) {
        setOpen(false);
        setVisible(false);
        setMounted(false);
      }
    };
    mobileViewport.addEventListener("change", onViewportChange);
    return () => mobileViewport.removeEventListener("change", onViewportChange);
  }, []);

  useEffect(() => {
    if (open) {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setMounted(true);
      enterFrame.current = requestAnimationFrame(() => {
        enterFrame.current = requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      if (mounted) closeTimer.current = setTimeout(() => setMounted(false), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 320);
    }
    return () => {
      if (enterFrame.current !== null) cancelAnimationFrame(enterFrame.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
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
  }, [mounted]);

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
      {mounted && createPortal(
        <>
          <button data-visible={visible} className="mobile-menu-scrim" type="button" aria-label="Close menu" onClick={close} />
          <nav id="mobile-site-menu" className="mobile-menu-panel" data-visible={visible} aria-label={menuLabel}>
            <div className="mobile-menu-drawer-head">
              <strong>{menuLabel}</strong>
              <button type="button" aria-label="Close menu" onClick={close}>×</button>
            </div>
            <details open>
              <summary>{unitsLabel}</summary>
              <div>{units.map((item) => <Link key={item.href} href={item.href} onClick={close}>{item.label}</Link>)}</div>
            </details>
            <details>
              <summary>{partsLabel}</summary>
              <div>{parts.map((item) => <Link key={item.href} href={item.href} onClick={close}>{item.label}</Link>)}</div>
            </details>
            <div className="mobile-menu-languages" role="group" aria-label="Language"><Link href={englishPath} aria-current={locale === "en" ? "page" : undefined} onClick={close}>English</Link><Link href={chinesePath} aria-current={locale === "zh" ? "page" : undefined} onClick={close}>中文</Link></div>
            <div className="mobile-menu-primary">
              {links.map((item) => <Link key={item.href} href={item.href} onClick={close}>{item.label}</Link>)}
            </div>
          </nav>
        </>,
        document.body
      )}
    </div>
  );
}
