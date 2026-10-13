"use client";

import { useState } from "react";

/** Keep important purchasing controls visible even with verbose Shopify copy. */
export function ProductDescriptionPreview({
  description,
  locale,
}: {
  description: string;
  locale: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = description.trim().length > 160;
  const showLabel = locale === "zh" ? "查看更多" : "Show more";
  const hideLabel = locale === "zh" ? "收起" : "Show less";

  return (
    <div className="pdp-summary-preview">
      <p className={canExpand && !expanded ? "pdp-summary pdp-summary-collapsed" : "pdp-summary"}>
        {description}
      </p>
      {canExpand && (
        <button
          type="button"
          className="pdp-summary-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? hideLabel : showLabel}
          <span aria-hidden="true">{expanded ? " −" : " +"}</span>
        </button>
      )}
    </div>
  );
}
