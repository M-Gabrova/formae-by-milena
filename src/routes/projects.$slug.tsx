import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Facebook, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import headerLogo from "@/assets/formae-beige-tight.png";
import beigeLogo from "@/assets/beige-logo.png";
import { useLanguage, type Language } from "@/hooks/use-language";
import { publishedProjectQuery, PUBLIC_CATEGORIES } from "@/lib/public-projects";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(publishedProjectQuery(params.slug));
    if (!data) throw notFound();
    return { title: data.project.title_bg, titleEn: data.project.title_en, description: data.project.description_bg };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Проектът не е намерен | FORMAE by Milena" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} · ${loaderData.titleEn} | FORMAE by Milena`;
    const description = (loaderData.description ?? "Интериорен проект и 3D визуализация от FORMAE by Milena.").slice(0, 160);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProjectPage,
  notFoundComponent: ProjectNotFound,
  errorComponent: ProjectError,
});

const L = (lang: Language, bg: string, en: string) => (lang === "bg" ? bg : en);

function Shell({ children, language, setLanguage }: { children: React.ReactNode; language: Language; setLanguage: (l: Language) => void }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-hero-foreground/15 bg-hero/90 text-hero-foreground backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link to="/" aria-label="FORMAE home"><img src={headerLogo} alt="FORMAE by Milena" width={392} height={320} className="h-16 w-24 object-contain object-left sm:h-[4.5rem] sm:w-28" /></Link>
          <div className="flex items-center gap-5">
            <Link to="/" hash="projects" className="nav-link hidden text-[11px] uppercase tracking-[0.17em] text-hero-foreground/75 sm:block">{L(language, "Всички проекти", "All projects")}</Link>
            <div className="flex items-center border border-hero-foreground/25 p-1" aria-label="Language">
              {(["bg", "en"] as const).map((lang) => (
                <button key={lang} onClick={() => setLanguage(lang)} className={`px-2.5 py-1 text-[10px] font-semibold uppercase transition-colors ${language === lang ? "bg-sage text-primary-foreground" : "text-hero-foreground/60"}`} aria-pressed={language === lang}>{lang}</button>
              ))}
            </div>
          </div>
        </div>
      </header>
      {children}
      <footer className="bg-footer px-5 py-12 text-footer-foreground sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div><img src={beigeLogo} alt="FORMAE by Milena" width={500} height={500} loading="lazy" className="w-36" /><p className="mt-3 text-xs uppercase tracking-[0.25em] text-footer-foreground/55">Design Your Life</p></div>
          <div className="space-y-2 text-sm text-footer-foreground/65 md:text-right"><a href="mailto:formae.by.milena@gmail.com" className="block hover:text-footer-foreground">formae.by.milena@gmail.com</a><p className="pt-4 text-xs">© {new Date().getFullYear()} FORMAE by Milena</p></div>
        </div>
      </footer>
    </main>
  );
}

function ProjectPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(publishedProjectQuery(slug));
  const [language, setLanguage] = useLanguage();
  const [open, setOpen] = useState<number | null>(null);
  if (!data) return <ProjectNotFound />;
  const { project, images, prev, next } = data;
  const title = L(language, project.title_bg, project.title_en);
  const description = L(language, project.description_bg ?? "", project.description_en ?? "");
  const cat = PUBLIC_CATEGORIES[project.category ?? ""];
  const specs = [
    project.location && { label: L(language, "Локация", "Location"), value: project.location },
    project.area_m2 && { label: L(language, "Площ", "Area"), value: `${project.area_m2} m²` },
    cat && { label: L(language, "Категория", "Category"), value: L(language, cat.bg, cat.en) },
    project.design_style && { label: L(language, "Стил", "Design style"), value: project.design_style },
    project.completion_year && { label: L(language, "Година", "Year"), value: String(project.completion_year) },
  ].filter(Boolean) as { label: string; value: string }[];
  const tags = (project.client_tags ?? []).filter((t) => t.trim());
  const [cover, ...gallery] = images;

  return (
    <Shell language={language} setLanguage={setLanguage}>
      <section className="relative bg-hero pt-20 text-hero-foreground">
        {cover ? (
          <div className="relative h-[68vh] min-h-[420px] w-full overflow-hidden">
            <button onClick={() => setOpen(0)} className="block h-full w-full" aria-label={L(language, "Отвори снимката", "Open photo")}>
              <img src={cover.url} alt={L(language, cover.caption_bg ?? title, cover.caption_en ?? title)} fetchPriority="high" className="h-full w-full object-cover" />
            </button>
            <div className="pointer-events-none absolute inset-0 bg-project-overlay" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 content-wrap pb-12">
              {cat && <p className="eyebrow text-sage-light">{L(language, cat.bg, cat.en)}</p>}
              <h1 className="section-title mt-4">{title}</h1>
            </div>
          </div>
        ) : (
          <div className="content-wrap py-24">{cat && <p className="eyebrow text-sage-light">{L(language, cat.bg, cat.en)}</p>}<h1 className="section-title mt-4">{title}</h1></div>
        )}
      </section>

      <section className="section-space">
        <div className="section-grid">
          <aside>
            {specs.length > 0 && (
              <dl className="divide-y divide-border border-y border-border">
                {specs.map((s) => <div key={s.label} className="flex justify-between gap-6 py-4"><dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.label}</dt><dd className="text-right text-sm">{s.value}</dd></div>)}
              </dl>
            )}
            {tags.length > 0 && <div className="mt-8 flex flex-wrap gap-2">{tags.map((t) => <span key={t} className="border border-border px-3 py-1 text-xs text-muted-foreground">{t}</span>)}</div>}
          </aside>
          <div>
            <p className="eyebrow">{L(language, "За проекта", "About the project")}</p>
            {description ? <div className="mt-6 space-y-5 text-lg leading-8 text-foreground/80">{description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div> : <p className="mt-6 font-display text-3xl">{title}</p>}
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="pb-24">
          <div className="content-wrap grid gap-5 sm:grid-cols-2">
            {gallery.map((img, i) => {
              const cap = L(language, img.caption_bg ?? "", img.caption_en ?? "");
              return (
                <figure key={img.id} className={i % 3 === 2 ? "sm:col-span-2" : ""}>
                  <button onClick={() => setOpen(i + 1)} className="project-card group block w-full" aria-label={L(language, "Отвори снимката", "Open photo")}>
                    <img src={img.url} alt={cap || title} loading="lazy" className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] ${i % 3 === 2 ? "aspect-[16/9]" : "aspect-[4/3]"}`} />
                  </button>
                  {cap && <figcaption className="mt-3 text-xs text-muted-foreground">{cap}</figcaption>}
                </figure>
              );
            })}
          </div>
        </section>
      )}

      <section className="bg-hero py-20 text-hero-foreground">
        <div className="content-wrap grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow text-sage-light">{L(language, "Вашият дом", "Your home")}</p>
            <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">{L(language, "Харесва ли ви този проект? Нека създадем вашия.", "Like this project? Let's create yours.")}</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-13 rounded-none px-7 uppercase tracking-[0.12em]"><a href="mailto:formae.by.milena@gmail.com"><Mail />{L(language, "Изпрати запитване", "Send an inquiry")}</a></Button>
            <Button asChild size="lg" variant="heroOutline" className="h-13 rounded-none px-7 uppercase tracking-[0.12em]"><a href="https://www.facebook.com/FORMAE.by.Milena" target="_blank" rel="noreferrer"><Facebook />Facebook</a></Button>
          </div>
        </div>
      </section>

      {(prev || next) && (
        <nav className="content-wrap grid gap-4 py-14 sm:grid-cols-2" aria-label={L(language, "Други проекти", "More projects")}>
          {prev ? <Link to="/projects/$slug" params={{ slug: prev.slug }} className="group border-t border-border pt-5"><p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"><ArrowLeft className="size-3" />{L(language, "Предишен", "Previous")}</p><p className="mt-2 font-display text-2xl group-hover:text-primary">{L(language, prev.title_bg, prev.title_en)}</p></Link> : <span />}
          {next && <Link to="/projects/$slug" params={{ slug: next.slug }} className="group border-t border-border pt-5 sm:text-right"><p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:justify-end">{L(language, "Следващ", "Next")}<ArrowRight className="size-3" /></p><p className="mt-2 font-display text-2xl group-hover:text-primary">{L(language, next.title_bg, next.title_en)}</p></Link>}
        </nav>
      )}

      <Lightbox images={images} index={open} onChange={setOpen} language={language} title={title} />
    </Shell>
  );
}

function Lightbox({ images, index, onChange, language, title }: { images: { url: string; caption_bg: string | null; caption_en: string | null }[]; index: number | null; onChange: (i: number | null) => void; language: Language; title: string }) {
  const count = images.length;
  const go = useCallback((d: number) => { if (index !== null) onChange((index + d + count) % count); }, [index, count, onChange]);
  const [touch, setTouch] = useState<number | null>(null);
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);
  const img = index !== null ? images[index] : null;
  const cap = img ? L(language, img.caption_bg ?? "", img.caption_en ?? "") : "";
  return (
    <Dialog open={index !== null} onOpenChange={(o) => !o && onChange(null)}>
      <DialogContent className="max-w-[96vw] border-none bg-hero p-0 text-hero-foreground sm:max-w-[92vw] [&>button]:hidden">
        <DialogTitle className="sr-only">{cap || title}</DialogTitle>
        {img && (
          <div className="relative" onTouchStart={(e) => setTouch(e.touches[0]?.clientX ?? null)} onTouchEnd={(e) => { const x = e.changedTouches[0]?.clientX; if (touch !== null && x !== undefined && Math.abs(x - touch) > 40) go(x < touch ? 1 : -1); setTouch(null); }}>
            <img src={img.url} alt={cap || title} className="max-h-[86vh] w-full object-contain" />
            <button onClick={() => onChange(null)} className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-hero/70" aria-label={L(language, "Затвори", "Close")}><X className="size-4" /></button>
            {count > 1 && <>
              <button onClick={() => go(-1)} className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-hero/70" aria-label={L(language, "Предишна", "Previous")}><ChevronLeft /></button>
              <button onClick={() => go(1)} className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-hero/70" aria-label={L(language, "Следваща", "Next")}><ChevronRight /></button>
            </>}
            <div className="flex justify-between gap-4 px-5 py-3 text-xs text-hero-foreground/70"><span>{cap}</span><span>{(index ?? 0) + 1} / {count}</span></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProjectNotFound() {
  const [language, setLanguage] = useLanguage();
  return (
    <Shell language={language} setLanguage={setLanguage}>
      <section className="content-wrap flex min-h-[70vh] flex-col items-start justify-center pt-20">
        <p className="eyebrow">404</p>
        <h1 className="section-title mt-5">{L(language, "Този проект не е наличен.", "This project isn't available.")}</h1>
        <p className="mt-5 max-w-md text-muted-foreground">{L(language, "Възможно е да е преместен или все още да не е публикуван.", "It may have moved or isn't published yet.")}</p>
        <Button asChild className="mt-8 rounded-none uppercase tracking-[0.12em]"><Link to="/" hash="projects"><ArrowLeft />{L(language, "Към проектите", "Back to projects")}</Link></Button>
      </section>
    </Shell>
  );
}

function ProjectError() {
  const [language, setLanguage] = useLanguage();
  return (
    <Shell language={language} setLanguage={setLanguage}>
      <section className="content-wrap flex min-h-[70vh] flex-col items-start justify-center pt-20">
        <h1 className="section-title">{L(language, "Проектът не можа да се зареди.", "The project couldn't load.")}</h1>
        <Button className="mt-8 rounded-none" onClick={() => window.location.reload()}>{L(language, "Опитай отново", "Try again")}</Button>
      </section>
    </Shell>
  );
}
