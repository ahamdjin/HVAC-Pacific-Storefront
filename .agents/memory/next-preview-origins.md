---
name: Next.js preview origins
description: Next.js development-origin checks behind the Replit preview proxy.
---

Use the exact runtime development hostname and loopback in Next.js `allowedDevOrigins`, rather than relying on a wildcard for the top-level Replit development domain.

**Why:** Replit preview hosts can have multiple subdomain levels; the broad wildcard did not authorize the actual proxy origin. Next.js blocked live reload while normal pages still rendered successfully.

**How to apply:** When configuring or troubleshooting Next.js development previews, derive the hostname from the runtime-provided development-domain environment variable and include loopback for local screenshot access. Do not treat live-reload errors as evidence that the rendered storefront is broken.