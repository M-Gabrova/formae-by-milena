// Public (visitor) reads of the portfolio. Uses the publishable key with no
// session, so Supabase RLS only returns published projects and their photos.
import { createClient } from "@supabase/supabase-js";
import { queryOptions } from "@tanstack/react-query";
import type { Database, Tables } from "@/integrations/supabase/types";
import { PROJECT_IMAGES_BUCKET } from "@/lib/project-images";

type Project = Tables<"projects">;

let client: ReturnType<typeof createClient<Database>> | null = null;
function publicClient() {
  if (!client) {
    client = createClient<Database>(
      import.meta.env["VITE_SUPABASE_URL"],
      import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
      { auth: { persistSession: false, autoRefreshToken: false, storage: undefined } },
    );
  }
  return client;
}

export const PUBLIC_CATEGORIES: Record<string, { filter: string; bg: string; en: string }> = {
  living: { filter: "living", bg: "Дневна", en: "Living Room" },
  kitchen: { filter: "kitchen", bg: "Кухня", en: "Kitchen" },
  bedroom: { filter: "bedroom", bg: "Спалня", en: "Bedroom" },
  bathroom: { filter: "bathroom", bg: "Баня", en: "Bathroom" },
  "full-home": { filter: "home", bg: "Цялостна концепция", en: "Full Home Concept" },
};

export type PublicImage = { id: string; url: string; caption_bg: string | null; caption_en: string | null };
export type PublicProjectCard = Project & { cover: string | null };
export type PublicProjectDetail = {
  project: Project;
  images: PublicImage[];
  prev: { slug: string; title_bg: string; title_en: string } | null;
  next: { slug: string; title_bg: string; title_en: string } | null;
};

const SIGN_SECONDS = 60 * 60 * 6;

async function signPaths(paths: string[]) {
  const out: Record<string, string> = {};
  if (!paths.length) return out;
  const { data, error } = await publicClient().storage.from(PROJECT_IMAGES_BUCKET).createSignedUrls(paths, SIGN_SECONDS);
  if (error) throw error;
  for (const item of data ?? []) if (item.path && item.signedUrl) out[item.path] = item.signedUrl;
  return out;
}

async function fetchPublishedList(): Promise<PublicProjectCard[]> {
  const sb = publicClient();
  const { data, error } = await sb
    .from("projects")
    .select("*, project_images(storage_path, display_order)")
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  const covers = rows.map((r) => {
    const imgs = [...(r.project_images ?? [])].sort((a, b) => a.display_order - b.display_order);
    return imgs[0]?.storage_path ?? null;
  });
  const urls = await signPaths(covers.filter((p): p is string => !!p));
  return rows.map(({ project_images: _imgs, ...p }, i) => ({ ...p, cover: covers[i] ? urls[covers[i]!] ?? null : null }));
}

async function fetchPublishedDetail(slug: string): Promise<PublicProjectDetail | null> {
  const sb = publicClient();
  const { data: project, error } = await sb.from("projects").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) throw error;
  if (!project) return null;
  const [{ data: imgs, error: imgErr }, { data: all, error: allErr }] = await Promise.all([
    sb.from("project_images").select("*").eq("project_id", project.id).order("display_order", { ascending: true }),
    sb.from("projects").select("slug, title_bg, title_en").eq("status", "published").order("display_order", { ascending: true }).order("created_at", { ascending: false }),
  ]);
  if (imgErr) throw imgErr;
  if (allErr) throw allErr;
  const urls = await signPaths((imgs ?? []).map((i) => i.storage_path));
  const images = (imgs ?? [])
    .filter((i) => urls[i.storage_path])
    .map((i) => ({ id: i.id, url: urls[i.storage_path]!, caption_bg: i.caption_bg, caption_en: i.caption_en }));
  const list = all ?? [];
  const idx = list.findIndex((p) => p.slug === slug);
  return {
    project,
    images,
    prev: idx > 0 ? list[idx - 1]! : null,
    next: idx >= 0 && idx < list.length - 1 ? list[idx + 1]! : null,
  };
}

export const publishedProjectsQuery = () =>
  queryOptions({ queryKey: ["public-projects"], queryFn: fetchPublishedList, staleTime: 60_000 });

export const publishedProjectQuery = (slug: string) =>
  queryOptions({ queryKey: ["public-project", slug], queryFn: () => fetchPublishedDetail(slug), staleTime: 60_000 });
