# Batch 2 — Admin Dashboard & Media Management

Scope: private admin area plus hiding the phone number on the public site. Public design, homepage portfolio, logos, favicon, Netlify config and security rules stay unchanged. No database changes expected.

## 1. Admin area layout (/admin)
- Admin-only gate: not signed in -> `/admin/login`; signed in without admin role -> "No access" screen with sign-out. The database rules remain the real protection.
- FORMAE-styled shell: side menu (top bar on mobile) with Projects, Add project, Content (placeholder "coming later"), signed-in email, Logout.
- Pages:
  - `/admin` -> project list
  - `/admin/projects/new` -> create
  - `/admin/projects/$id` -> edit + images
  - `/admin/projects/$id/preview` -> private preview (all images, both languages, "Draft" badge)
  - `/admin/content` -> placeholder only
- All marked noindex.

## 2. Project list
- Table on desktop, cards on mobile: cover thumbnail, title (BG/EN), category, status, display order, year, last updated.
- Actions: Edit, Preview, Duplicate (copy as draft with new unique slug, no images copied), Delete.
- Draft/Published toggle per row.
- Reorder with up/down arrows, saved to `display_order`.

## 3. Project editor
- Sections: Basic info (BG/EN titles and descriptions, slug), Project info (category from the 5 site categories, area m², location, year, style, tags as chips), Publishing (Draft/Published, display order).
- Slug auto-generated from the English title (Bulgarian transliterated if empty) only while creating and until edited by hand; never overwritten silently.
- Validation: required titles and slug, slug format, number ranges, length limits; duplicate slug shows a clear message.
- Buttons: Save as draft, Publish, Delete. Images section appears after the first save (a project id is needed for the storage folder).

## 4. Images
- Drag-and-drop or multi-select, images only, max 20MB each; per-file progress bar.
- Upload to `project-images` at `projects/{project_id}/{timestamp-safe-name}`, then record the path in `project_images`.
- Previews via temporary signed links (never public links).
- BG/EN caption per image, reorder with arrows; first image marked "Cover".
- Remove image: deletes the file and the record; failures are shown.

## 5. Delete behavior
- Project delete asks for confirmation, removes all files in its folder first, then the project (records cascade). If file removal fails, the project is kept and an error is shown.

## 6. Phone number (public site)
- Remove the Phone row in the Contact section and the phone link in the footer.
- Keep email, Instagram, Facebook, and the floating WhatsApp and Viber buttons (they work without showing the number). The number stays in the code for WhatsApp/Viber.

## 7. Feedback
- Toast messages for success and every failure listed in the brief; loading states on all buttons; session expiry sends back to login with a message.

## Technical details
- All reads/writes through the browser Supabase client as the signed-in user, so existing RLS enforces permissions; no service-role key.
- Shared helper `src/lib/project-images.ts` (`getSignedImageUrl(s)`, path builder) reusable in Batch 3.
- TanStack Query for lists/mutations; Sonner `<Toaster />` mounted only in the admin layout.
- Route files: `admin.tsx` (layout + gate, ssr false), `admin.index.tsx`, `admin.projects.new.tsx`, `admin.projects.$id.tsx`, `admin.projects.$id.preview.tsx`, `admin.content.tsx`; `admin.login.tsx` rendered outside the gate.
- Untested until you create your admin account: real sign-in, uploads and deletes as admin (I will test anonymous refusal again).
