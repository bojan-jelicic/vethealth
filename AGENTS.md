# Project rules

- Static mode: when `FEATURES.staticMode` is true, the public site reads all content (clinic info, price list, blog) from `src/data/content.json` via `src/data/staticContent.ts`, and admin/portal routes are not mounted. Why: the site is hosted as a free static build on Cloudflare Pages; flipping the flag to false restores the database-backed version with the admin panel.
- Content updates in static mode are made by editing `src/data/content.json` (new images go to `public/content/` and are referenced as `/content/<file>`). Keep the JSON shape identical to the database rows so switching back to the database stays a one-line change.
- `public/_redirects` holds the Cloudflare Pages SPA fallback; keep it.
- Use the shared versioned logo asset pointer for site and document logos; replacing its URL prevents stale images from reusing an older logo address.
