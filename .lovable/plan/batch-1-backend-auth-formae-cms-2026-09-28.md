# Batch 1 — Backend & Auth (FORMAE CMS)

Scope: database, storage, security, admin login only. No changes to the public site, homepage portfolio, logos, favicon, Netlify config or build settings.

## 1. Database (one migration in your Supabase project)
- `app_role` enum: `admin`, `editor` (editor reserved for later).
- `user_roles` table (user_id, role, unique pair) + `has_role(user_id, role)` security-definer function. Roles live in their own table, never on a profile, to prevent privilege escalation.
- `projects`: all fields as specified; `slug` unique; `status` limited to draft/published (default draft); `display_order` default 0; `client_tags text[]`; timestamps with auto-update trigger on `updated_at`.
- `project_images`: fields as specified; `project_id` FK with ON DELETE CASCADE; only storage paths stored.
- Indexes: `projects(status, display_order)`, `project_images(project_id, display_order)`.
- Grants for anon/authenticated/service_role as needed.

## 2. Row Level Security
- projects: anyone reads rows with `status = 'published'`; admins (via `has_role`) read/create/update/delete everything.
- project_images: anyone reads images whose project is published; admins full access.
- user_roles: users can read only their own roles; no one can write from the browser.
- A signed-in user without the admin role gets public-level access only.

## 3. Storage
- Bucket `project-images`, public read (intentional, portfolio images are public), 20MB file limit.
- Path convention `projects/{project_id}/{filename}`.
- Storage policies enforced by Supabase itself:
  - Visitors (anonymous and signed-in): read only.
  - No insert, update or delete policy for anonymous users, so these are denied by default.
  - Insert, update and delete allowed only when `has_role(auth.uid(), 'admin')` is true.

## 3b. Security verification (done after the build)
- Test as an anonymous visitor: file read works; upload, overwrite and delete are rejected.
- Test as a signed-in user without the admin role: writes are rejected.
- Deleting a project removes its `project_images` rows automatically (ON DELETE CASCADE), checked with a test project that is then removed.
- Image files themselves are not deleted by the database. The Batch 2 editor will remove the `projects/{project_id}/` folder when a project is deleted, so no files are left behind.
- Scan the browser code to confirm only the publishable key is present and no service-role key is used.

## 4. Admin login
- `/admin/login`: FORMAE-styled email + password form, no sign-up link, error messages in Bulgarian/English style consistent with the site.
- `/admin`: minimal temporary protected placeholder ("Admin — coming soon", shows signed-in email and role status, sign-out button). Unauthenticated visitors are redirected to `/admin/login`; signed-in non-admins see "no access".
- Email sign-in enabled in Supabase Auth; public signups disabled.
- Routes marked noindex.

## 5. Manual steps for you (Supabase dashboard)
1. Authentication → Users → "Add user": create your admin account (email + password, auto-confirm).
2. Run one SQL line (I will give it to you with your email) to grant yourself the admin role.
3. Confirm Authentication → Sign In / Providers → "Allow new users to sign up" is OFF.

## Technical details
- Browser uses only the publishable key; no service-role key in client code.
- Auth gate: `src/routes/admin/route.tsx`-style layout (`ssr: false`, `beforeLoad` → `getUser()`), login page stays outside the gate; root listens to `onAuthStateChange` to refresh.
- Admin check reads `user_roles` via RLS (own rows) — the database, not the frontend, enforces permissions.
- Final report will list tables, columns, indexes, policies, bucket, and env vars (existing SUPABASE_URL / publishable key only).
