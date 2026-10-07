export type ManufacturerDocument = {
  title: string;
  kind?: string;
  url?: string;
  hosted?: boolean;
  fileSize?: string;
};

export type ManufacturerContentBlock = {
  title: string;
  text?: string;
  bullets?: string[];
};

export type ManufacturerSection = {
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
