# Batch 3 — Public Project Pages & Homepage Portfolio Sync

## What visitors will see
- **Homepage Projects section**: same design, filters and card layout, but cards now come from the published projects in Supabase (ordered by display order, cover = first photo). Clicking a card opens its project page.
- **Project page `/projects/<slug>`**: in FORMAE style — large cover photo, title, short spec line, description, a spec list (location, area, category, style, year — empty fields hidden), tags, a photo gallery with full-screen viewer (arrows, keyboard, swipe, Esc), Previous / Next project links, and a contact block that reuses the existing WhatsApp / Viber / email actions.
- **Draft or missing slug**: a calm "Project not found" page with a link back to the portfolio. Draft content is never sent to visitors — the database rules already hide it.
- **Language**: the BG/EN switch keeps working and now carries over between the homepage and project pages (remembered in the browser), so a visitor who picked EN stays in EN.

## Publish flow
Draft → hidden from grid and page returns Not found. Published → appears in grid, page loads. Back to Draft → disappears again. No admin changes needed.

## Empty portfolio
Supabase is the only source for the portfolio. The hand-made example cards are taken out. If no projects are published, or a filter has no matches, the grid shows a calm message:
- BG: „Скоро тук ще откриете избрани проекти на FORMAE.“
- EN: "Selected FORMAE projects will appear here soon."

## Not changed
Admin panel, database tables, security rules, storage privacy, logos, favicon, colors, fonts, header/footer, contact info, Netlify settings.

## Technical details
- New route `src/routes/projects.$slug.tsx`; loader uses the public (anon) Supabase client, query `status='published' and slug=?`, throws `notFound()` otherwise; `head()` with localized title/description, og tags, `robots: noindex` when not found. og:image only if a stable absolute URL is available (signed URLs expire, so omitted).
- New `src/lib/public-projects.ts`: `fetchPublishedProjects()`, `fetchPublishedProject(slug)` (with images + prev/next neighbours by display_order), reusing `getSignedImageUrls` from `project-images.ts` (bucket stays private; storage policy already allows reads of published-project files). TanStack Query `queryOptions` + `ensureQueryData` / `useSuspenseQuery`.
- Category mapping: admin keys living/kitchen/bedroom/bathroom/full-home → existing homepage filter keys (incl. `full-home` → `home`).
- Shared language: small `useLanguage` hook (localStorage, read after hydration to avoid mismatches); homepage `language` state switched to it — no visual change.
- Lightbox built with the existing dialog component; images lazy-loaded with width/height set.
- Verify with Playwright: homepage grid, a published slug, an unknown slug, language persistence, mobile width. Draft-hidden check confirmed via anon query.

Note: your message was cut off after "Do not show empty labels". If there were more requirements after section 4, send them and I will update this plan.
