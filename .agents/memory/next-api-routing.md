---
name: Next.js API routing
description: Keep Next.js route handlers reachable behind the shared API artifact.
---

Give Next.js API route prefixes explicit ownership in the storefront artifact's service paths when they coexist with the shared API artifact.

**Why:** The shared service owns the broad `/api` prefix. Without a more specific storefront path, the proxy sends Next.js API requests to the unrelated Express server even though their handlers work on the Next.js port. Server-rendered catalog pages can work while cart or form requests fail.

**How to apply:** When adding a Next.js route handler, register its specific path through the validated artifact configuration flow. Verify requests through the preview proxy, not only directly against the Next.js port. Leave unrelated shared API routes in place.