type ManufacturerDocument = {
  title: string;
  kind?: string;
  url: string;
  hosted?: boolean;
};

type ManufacturerSection = {
  key: string;
  title: string;
  summary?: string;
  documents?: ManufacturerDocument[];
};

export type ManufacturerResourceData = {
  manufacturer: string;
  family?: string;
  sourceUrl?: string;
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

export function ManufacturerResources({ data }: { data: ManufacturerResourceData }) {
  return (
    <section className="pdp-section manufacturer-resources" aria-labelledby="manufacturer-resources-title">
      <div className="manufacturer-resources-head">
        <div>
          <p className="eyebrow">Manufacturer resources</p>
          <h2 id="manufacturer-resources-title">
            {data.manufacturer}{data.family ? ` ${data.family}` : ""} product information
          </h2>
          {data.overview && <p>{data.overview}</p>}
        </div>
        {data.sourceUrl && (
          <a className="manufacturer-source-link" href={data.sourceUrl} target="_blank" rel="noreferrer">
            View manufacturer page ↗
          </a>
        )}
      </div>

      {data.features?.length ? (
        <div className="manufacturer-features">
          <h3>Key manufacturer features</h3>
          <ul>{data.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
        </div>
      ) : null}

      {data.specifications?.length ? (
        <div className="manufacturer-specs">
          <h3>Manufacturer specifications</h3>
          <div className="spec-table">
            {data.specifications.map((spec) => (
              <div key={spec.label}>
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data.sections?.length ? (
        <div className="manufacturer-resource-groups">
          {data.sections.map((section) => (
            <section className="manufacturer-resource-card" key={section.key}>
              <h3>{section.title}</h3>
              {section.summary && <p>{section.summary}</p>}
              {section.documents?.length ? (
                <div className="manufacturer-document-list">
                  {section.documents.map((doc) => (
                    <a href={doc.url} target="_blank" rel="noreferrer" key={doc.title}>
                      <span>
                        <strong>{doc.title}</strong>
                        <small>{doc.kind || "Document"}{doc.hosted ? " · Download" : " · Midea source"}</small>
                      </span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      ) : null}
    </section>
  );
}
