import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryLabel, fetchImages, fetchProject, friendlyError } from "@/lib/admin-projects";
import { getSignedImageUrls } from "@/lib/project-images";

export const Route = createFileRoute("/admin/projects/$id/preview")({
  head: () => ({
    meta: [
      { title: "Preview | FORMAE Admin" },
      { name: "description", content: "Private project preview." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Preview | FORMAE Admin" },
      { property: "og:description", content: "Private project preview." },
    ],
  }),
  component: Preview,
});

function Preview() {
  const { id } = Route.useParams();
  const [lang, setLang] = useState<"bg" | "en">("bg");
  const project = useQuery({ queryKey: ["admin-project", id], queryFn: () => fetchProject(id) });
  const images = useQuery({ queryKey: ["admin-images", id], queryFn: () => fetchImages(id) });
  const urls = useQuery({
    queryKey: ["admin-image-urls", images.data?.map((i) => i.storage_path).join("|")],
    enabled: !!images.data,
    queryFn: () => getSignedImageUrls(images.data!.map((i) => i.storage_path)),
  });

  if (project.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (project.error) return <p className="text-destructive">{friendlyError(project.error)}</p>;
  const p = project.data;
  if (!p) return <p>Project not found.</p>;

  const title = lang === "bg" ? p.title_bg : p.title_en;
  const desc = lang === "bg" ? p.description_bg : p.description_en;

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/projects/$id" params={{ id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Редакция / Edit</Link>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs uppercase tracking-wider ${p.status === "published" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
          <Button size="sm" variant={lang === "bg" ? "default" : "outline"} onClick={() => setLang("bg")}>BG</Button>
          <Button size="sm" variant={lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}>EN</Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Личен преглед — не е публичната страница. / Private preview — not the final public page.</p>
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{categoryLabel(p.category)}</p>
        <h1 className="font-display text-4xl sm:text-5xl">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {[p.location, p.area_m2 ? `${p.area_m2} m²` : null, p.completion_year, p.design_style].filter(Boolean).join(" · ")}
        </p>
        {!!p.client_tags?.length && <div className="flex flex-wrap gap-1.5">{p.client_tags.map((t) => <span key={t} className="bg-muted px-2 py-1 text-xs">{t}</span>)}</div>}
      </header>
      {desc && <p className="max-w-3xl whitespace-pre-line leading-7">{desc}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {images.data?.map((img, i) => (
          <figure key={img.id} className={i === 0 ? "sm:col-span-2" : ""}>
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              {urls.data?.[img.storage_path] && <img src={urls.data[img.storage_path]} alt={(lang === "bg" ? img.caption_bg : img.caption_en) ?? ""} className="size-full object-cover" />}
            </div>
            {(lang === "bg" ? img.caption_bg : img.caption_en) && <figcaption className="mt-2 text-xs text-muted-foreground">{lang === "bg" ? img.caption_bg : img.caption_en}</figcaption>}
          </figure>
        ))}
      </div>
    </div>
  );
}
