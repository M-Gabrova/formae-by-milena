import { useState, type FormEvent, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, projectSchema, slugify, type Project } from "@/lib/admin-projects";

export type ProjectFormValues = ReturnType<typeof projectSchema.parse>;

type Draft = {
  title_bg: string; title_en: string; description_bg: string; description_en: string; slug: string;
  category: string; area_m2: string; location: string; completion_year: string; design_style: string;
  client_tags: string[]; status: "draft" | "published"; display_order: string;
};

function toDraft(p?: Project | null): Draft {
  return {
    title_bg: p?.title_bg ?? "", title_en: p?.title_en ?? "",
    description_bg: p?.description_bg ?? "", description_en: p?.description_en ?? "",
    slug: p?.slug ?? "", category: p?.category ?? "", area_m2: p?.area_m2?.toString() ?? "",
    location: p?.location ?? "", completion_year: p?.completion_year?.toString() ?? "",
    design_style: p?.design_style ?? "", client_tags: p?.client_tags ?? [],
    status: (p?.status as Draft["status"]) ?? "draft", display_order: (p?.display_order ?? 0).toString(),
  };
}

export function ProjectForm({
  initial, saving, onSubmit, serverError,
}: {
  initial?: Project | null;
  saving: boolean;
  serverError?: string | null;
  onSubmit: (values: ProjectFormValues) => void;
}) {
  const [d, setD] = useState<Draft>(() => toDraft(initial));
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((prev) => {
      const next = { ...prev, [k]: v };
      if (!slugTouched && (k === "title_en" || k === "title_bg")) {
        next.slug = slugify(next.title_en || next.title_bg);
      }
      return next;
    });
  };

  function addTag() {
    const t = tagInput.trim().replace(/,$/, "");
    if (t && !d.client_tags.includes(t)) set("client_tags", [...d.client_tags, t]);
    setTagInput("");
  }
  function onTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
  }

  function submit(status: Draft["status"]) {
    return (e?: FormEvent) => {
      e?.preventDefault();
      const parsed = projectSchema.safeParse({ ...d, status });
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        for (const issue of parsed.error.issues) errs[String(issue.path[0])] ??= issue.message;
        setErrors(errs);
        return;
      }
      setErrors({});
      setD((prev) => ({ ...prev, status }));
      onSubmit(parsed.data);
    };
  }

  const field = (k: keyof Draft, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} value={d[k] as string} onChange={(e) => set(k, e.target.value as never)} {...props} />
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit(d.status)} className="space-y-8">
      <section className="space-y-4 border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-xl">Основна информация / Basic information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {field("title_bg", "Заглавие (BG) *")}
          {field("title_en", "Title (EN) *")}
          <div className="space-y-1.5">
            <Label htmlFor="description_bg">Описание (BG)</Label>
            <Textarea id="description_bg" rows={6} value={d.description_bg} onChange={(e) => set("description_bg", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description_en">Description (EN)</Label>
            <Textarea id="description_en" rows={6} value={d.description_en} onChange={(e) => set("description_en", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (URL) *</Label>
          <Input id="slug" value={d.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value.toLowerCase()); }} />
          <p className="text-xs text-muted-foreground">/projects/{d.slug || "…"}</p>
          {errors["slug"] && <p className="text-xs text-destructive">{errors["slug"]}</p>}
        </div>
      </section>

      <section className="space-y-4 border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-xl">Детайли / Project information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="category">Категория / Category</Label>
            <select id="category" value={d.category} onChange={(e) => set("category", e.target.value)}
              className="h-9 w-full border border-input bg-background px-3 text-sm">
              <option value="">—</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.bg} / {c.en}</option>)}
            </select>
          </div>
          {field("area_m2", "Площ / Area (m²)", { type: "number", step: "0.1", min: 0 })}
          {field("location", "Локация / Location")}
          {field("completion_year", "Година / Completion year", { type: "number", min: 1950, max: 2100 })}
          {field("design_style", "Стил / Design style")}
          <div className="space-y-1.5">
            <Label htmlFor="tags">Тагове / Client tags</Label>
            <Input id="tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={onTagKey} onBlur={addTag} placeholder="Enter to add" />
            <div className="flex flex-wrap gap-1.5">
              {d.client_tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 bg-muted px-2 py-1 text-xs">
                  {t}
                  <button type="button" aria-label={`Remove ${t}`} onClick={() => set("client_tags", d.client_tags.filter((x) => x !== t))}><X className="size-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-xl">Публикуване / Publishing</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <p className="text-sm">Текущ статус / Current status: <strong>{d.status === "published" ? "Published" : "Draft"}</strong></p>
          {field("display_order", "Подредба / Display order", { type: "number", min: 0 })}
        </div>
        {serverError && <p role="alert" className="text-sm text-destructive">{serverError}</p>}
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" disabled={saving} onClick={() => submit("draft")()}>
            {saving ? "Запазване…" : "Запази чернова / Save as draft"}
          </Button>
          <Button type="button" disabled={saving} onClick={() => submit("published")()}>
            {saving ? "Запазване…" : "Публикувай / Publish"}
          </Button>
        </div>
      </section>
    </form>
  );
}
