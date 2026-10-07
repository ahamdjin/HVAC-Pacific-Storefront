"use client";

import { useMemo, useState } from "react";

type ManufacturerDocument = {
  title: string;
  kind?: string;
  url?: string;
  hosted?: boolean;
  fileSize?: string;
};

type ManufacturerContentBlock = {
  title: string;
  text?: string;
  bullets?: string[];
};

type ManufacturerSection = {
  key: string;
  title: string;
  summary?: string;
  content?: ManufacturerContentBlock[];
  specifications?: Array<{ label: string; value: string }>;
  documents?: ManufacturerDocument[];
};

export type ManufacturerResourceData = {
  manufacturer: string;
  family?: string;
  overview?: string;
  features?: string[];
  specifications?: Array<{ label: string; value: string }>;
  sections?: ManufacturerSection[];
};

export function parseManufacturerResources(value?: string) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as ManufacturerResourceData;
    if (!parsed || typeof parsed !== "object" || !parsed.manufacturer) return null;
    return parsed;
  } catch {
    return null;
  }
}

function PdfIcon() {
  return (
    <span className="manufacturer-file-icon manufacturer-file-icon-pdf" aria-hidden="true">
      <svg viewBox="0 0 44 52" role="img">
        <path d="M8 2h19l9 9v39H8z" />
        <path d="M27 2v10h9" />
        <text x="22" y="35" textAnchor="middle">PDF</text>
      </svg>
    </span>
  );
}

function FileIcon({ kind }: { kind?: string }) {
  if ((kind || "").toUpperCase() === "PDF") return <PdfIcon />;
  return (
    <span className="manufacturer-file-icon manufacturer-file-icon-generic" aria-hidden="true">
      <svg viewBox="0 0 44 52" role="img">
        <path d="M8 2h19l9 9v39H8z" />
        <path d="M27 2v10h9" />
        <text x="22" y="35" textAnchor="middle">{(kind || "FILE").slice(0, 4).toUpperCase()}</text>
      </svg>
    </span>
  );
}

function DocumentCards({ documents }: { documents?: ManufacturerDocument[] }) {
  const localDocuments = (documents || []).filter((doc) => doc.hosted && doc.url);
  if (!localDocuments.length) return null;

  return (
    <div className="manufacturer-downloads">
      <h4>Downloads</h4>
      <div className="manufacturer-document-grid">
        {localDocuments.map((doc) => (
          <a className="manufacturer-document-card" href={doc.url} target="_blank" rel="noreferrer" key={doc.title}>
            <FileIcon kind={doc.kind} />
            <span className="manufacturer-document-copy">
              <strong>{doc.title}</strong>
              <small>{[doc.kind || "Document", doc.fileSize].filter(Boolean).join(" · ")}</small>
            </span>
            <span className="manufacturer-download-action">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 20h14" />
              </svg>
              Download
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function ManufacturerResources({ data }: { data: ManufacturerResourceData }) {
  const sections = useMemo(() => {
    const base = data.sections || [];
    return base.length ? base : [{ key: "marketing", title: "Marketing" }];
  }, [data.sections]);
  const [activeKey, setActiveKey] = useState(sections[0]?.key || "marketing");
  const activeSection = sections.find((section) => section.key === activeKey) || sections[0];
  const isMarketing = activeSection?.key === "marketing";

  return (
    <section className="pdp-section manufacturer-resources" aria-labelledby="manufacturer-resources-title">
      <div className="manufacturer-resources-head">
        <p className="eyebrow">Product resources & technical information</p>
        <h2 id="manufacturer-resources-title">
          {data.manufacturer}{data.family ? ` ${data.family}` : ""} product information
        </h2>
        {data.overview && <p>{data.overview}</p>}
      </div>

      <div className="manufacturer-tabs" role="tablist" aria-label="Product resource categories">
        {sections.map((section) => {
          const selected = section.key === activeSection?.key;
          return (
            <button
              key={section.key}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`manufacturer-panel-${section.key}`}
              id={`manufacturer-tab-${section.key}`}
              className={selected ? "is-active" : ""}
              onClick={() => setActiveKey(section.key)}
            >
              {section.title}
            </button>
          );
        })}
      </div>

      {activeSection && (
        <div
          className="manufacturer-tab-panel"
          role="tabpanel"
          id={`manufacturer-panel-${activeSection.key}`}
          aria-labelledby={`manufacturer-tab-${activeSection.key}`}
        >
          <div className="manufacturer-tab-copy">
            <h3>{activeSection.title}</h3>
            {activeSection.summary && <p className="manufacturer-section-summary">{activeSection.summary}</p>}

            {isMarketing && data.features?.length ? (
              <div className="manufacturer-content-block">
                <h4>Key features</h4>
                <ul className="manufacturer-feature-list">
                  {data.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
              </div>
            ) : null}

            {activeSection.content?.map((block) => (
              <div className="manufacturer-content-block" key={block.title}>
                <h4>{block.title}</h4>
                {block.text && <p>{block.text}</p>}
                {block.bullets?.length ? (
                  <ul>{block.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                ) : null}
              </div>
            ))}

            {(activeSection.specifications?.length || (isMarketing && data.specifications?.length)) ? (
              <div className="manufacturer-content-block">
                <h4>{isMarketing ? "Key product specifications" : `${activeSection.title} specifications`}</h4>
                <div className="spec-table manufacturer-spec-table">
                  {(activeSection.specifications || data.specifications || []).map((spec) => (
                    <div key={spec.label}>
                      <span>{spec.label}</span>
                      <strong>{spec.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <DocumentCards documents={activeSection.documents} />
        </div>
      )}
    </section>
  );
}
