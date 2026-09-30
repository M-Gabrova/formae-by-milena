import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Project = Tables<"projects">;
export type ProjectImage = Tables<"project_images">;

export const CATEGORIES = [
  { value: "living", bg: "Дневни", en: "Living Rooms" },
  { value: "kitchen", bg: "Кухни", en: "Kitchens" },
  { value: "bedroom", bg: "Спални", en: "Bedrooms" },
  { value: "bathroom", bg: "Бани", en: "Bathrooms" },
  { value: "full-home", bg: "Цялостни концепции", en: "Full Home Concepts" },
] as const;

export function categoryLabel(v: string | null) {
  return CATEGORIES.find((c) => c.value === v)?.en ?? v ?? "—";
}

const map: Record<string, string> = {
  а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"ts",ч:"ch",ш:"sh",щ:"sht",ъ:"a",ь:"y",ю:"yu",я:"ya",
};
export function slugify(input: string) {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const optText = (max: number) => z.string().trim().max(max).optional().transform((v) => (v ? v : null));

export const projectSchema = z.object({
  title_bg: z.string().trim().min(1, "Заглавие (BG) е задължително").max(200),
  title_en: z.string().trim().min(1, "Title (EN) is required").max(200),
  description_bg: optText(5000),
  description_en: optText(5000),
  slug: z.string().trim().min(1, "Slug is required").max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only"),
  category: optText(50),
  area_m2: z.union([z.literal(""), z.coerce.number().min(0).max(100000)]).transform((v) => (v === "" ? null : v)),
  location: optText(120),
  completion_year: z.union([z.literal(""), z.coerce.number().int().min(1950).max(2100)]).transform((v) => (v === "" ? null : v)),
  design_style: optText(120),
  client_tags: z.array(z.string().trim().min(1).max(40)).max(20),
  status: z.enum(["draft", "published"]),
  display_order: z.coerce.number().int().min(0).max(100000),
});
export type ProjectInput = z.input<typeof projectSchema>;

export function friendlyError(err: unknown): string {
  const e = err as { code?: string; message?: string };
  if (e?.code === "23505") return "Този slug вече съществува. / This slug is already used by another project.";
  if (e?.code === "42501") return "Нямате права за това действие. / You don't have permission for this action.";
  if (e?.message?.toLowerCase().includes("jwt")) return "Сесията изтече. Влезте отново. / Session expired, please sign in again.";
  return e?.message ?? "Unexpected error";
}

export async function fetchProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_images(storage_path, display_order)")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchProject(id: string) {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchImages(projectId: string) {
  const { data, error } = await supabase
    .from("project_images")
    .select("*")
    .eq("project_id", projectId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function uniqueSlug(base: string) {
  let candidate = base;
  for (let i = 2; i < 50; i++) {
    const { data, error } = await supabase.from("projects").select("id").eq("slug", candidate).maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    candidate = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}
