"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ShopifyImage } from "@/lib/shopify/shared";

type GalleryLabels = {
  gallery: string;
  viewImage: string;
  previousImage: string;
  nextImage: string;
  closeGallery: string;
};

export function ProductGallery({
  images,
  title,
  unavailableLabel,
  labels,
}: {
  images: ShopifyImage[];
  title: string;
  unavailableLabel: string;
  labels: GalleryLabels;
}) {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowLeft" && count > 1) {
        setSelected((current) => (current - 1 + count) % count);
      }
      if (event.key === "ArrowRight" && count > 1) {
        setSelected((current) => (current + 1) % count);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, count]);

  if (!count) {
    return <div className="gallery-main image-placeholder">{unavailableLabel}</div>;
  }

  const active = images[selected] ?? images[0];
  const activeAlt = active.altText || `${title} product image ${selected + 1}`;

  function move(delta: number) {
    setSelected((current) => (current + delta + count) % count);
  }

  return (
    <div className="product-gallery" aria-label={labels.gallery}>
      <button
        type="button"
        className="product-gallery-main"
        onClick={() => setOpen(true)}
        aria-label={labels.viewImage}
      >
        <Image
          src={active.url}
          alt={activeAlt}
          width={active.width || 1400}
          height={active.height || 1400}
          priority
          sizes="(max-width:850px) 100vw, 52vw"
        />
        {count > 1 && <span className="product-gallery-count">{selected + 1} / {count}</span>}
      </button>

      {count > 1 && (
        <div className="product-gallery-thumbs" aria-label={labels.gallery}>
          {images.map((image, index) => (
            <button
              type="button"
              key={image.url}
              className={index === selected ? "product-gallery-thumb is-active" : "product-gallery-thumb"}
              onClick={() => setSelected(index)}
              aria-label={`${labels.viewImage} ${index + 1}`}
              aria-current={index === selected ? "true" : undefined}
            >
              <Image
                src={image.url}
                alt={image.altText || `${title} product image ${index + 1}`}
                width={image.width || 240}
                height={image.height || 240}
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          className="product-gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={labels.gallery}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <button
            type="button"
            className="product-gallery-close"
            onClick={() => setOpen(false)}
            aria-label={labels.closeGallery}
          >
            ×
          </button>

          {count > 1 && (
            <button
              type="button"
              className="product-gallery-arrow previous"
              onClick={() => move(-1)}
              aria-label={labels.previousImage}
            >
              ‹
            </button>
          )}

          <div className="product-gallery-lightbox-image">
            <Image
              src={active.url}
              alt={activeAlt}
              width={active.width || 1800}
              height={active.height || 1800}
              sizes="95vw"
            />
          </div>

          {count > 1 && (
            <button
              type="button"
              className="product-gallery-arrow next"
              onClick={() => move(1)}
              aria-label={labels.nextImage}
            >
              ›
            </button>
          )}

          {count > 1 && <div className="product-gallery-lightbox-count">{selected + 1} / {count}</div>}
        </div>
      )}
    </div>
  );
}
