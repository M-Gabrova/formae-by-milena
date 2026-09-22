import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BedDouble,
  ChevronRight,
  DraftingCompass,
  Facebook,
  Instagram,
  Layers3,
  Mail,
  Menu,
  MessageCircle,
  Palette,
  Phone,
  Ruler,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import beigeLogo from "@/assets/beige-logo.png.asset.json";
import heroImage from "@/assets/formae-hero-apartment.jpg";
import kitchenImage from "@/assets/formae-kitchen-apartment.jpg";
import bedroomImage from "@/assets/formae-bedroom-apartment-updated.jpg";
import bathroomImage from "@/assets/formae-bathroom-apartment.jpg";
import headerLogo from "@/assets/formae-light-logo.png.asset.json";

type Language = "bg" | "en";
type Copy = { bg: string; en: string };

const t = (copy: Copy, language: Language) => copy[language];

const services = [
  {
    icon: DraftingCompass,
    title: { bg: "Интериорни концепции", en: "Interior Concepts" },
    description: {
      bg: "Персонализирани дизайн концепции, съобразени с вашия начин на живот и пространство.",
      en: "Personalized design concepts tailored to your lifestyle and space.",
    },
  },
  {
    icon: Ruler,
    title: { bg: "2D разпределения", en: "2D Layout Planning" },
    description: {
      bg: "Функционално планиране на помещенията и оптимално разположение на мебелите.",
      en: "Functional room planning and optimized furniture placement.",
    },
  },
  {
    icon: Layers3,
    title: { bg: "3D визуализации", en: "3D Visualizations" },
    description: {
      bg: "Фотореалистични визуализации, с които виждате крайния резултат преди реализацията.",
      en: "Photorealistic visualizations that reveal the final result before implementation.",
    },
    featured: true,
  },
  {
    icon: Palette,
    title: { bg: "Материали и стил", en: "Material & Style Selection" },
    description: {
      bg: "Насоки за цветове, материали, текстури и избор на мебели.",
      en: "Guidance for colors, materials, textures, and furniture direction.",
    },
  },
];

const projects = [
  { image: heroImage, category: "living", title: { bg: "Градски уют", en: "Urban Calm" }, location: "Sofia · 86 m²" },
  { image: kitchenImage, category: "kitchen", title: { bg: "Кухня в салвия", en: "Sage Kitchen" }, location: "Sofia · 18 m²" },
  { image: bedroomImage, category: "bedroom", title: { bg: "Тиха спалня", en: "Quiet Bedroom" }, location: "Sofia · 16 m²" },
  { image: bathroomImage, category: "bathroom", title: { bg: "Топла текстура", en: "Warm Texture" }, location: "Sofia · 7 m²" },
];

const filters = [
  { key: "all", label: { bg: "Всички", en: "All" } },
  { key: "living", label: { bg: "Дневни", en: "Living Rooms" } },
  { key: "kitchen", label: { bg: "Кухни", en: "Kitchens" } },
  { key: "bedroom", label: { bg: "Спални", en: "Bedrooms" } },
  { key: "bathroom", label: { bg: "Бани", en: "Bathrooms" } },
  { key: "home", label: { bg: "Цялостни проекти", en: "Full Home Concepts" } },
];

const testimonials = [
  {
    quote: {
      bg: "Милена превърна идеите ни в ясна концепция и ни спести много колебания по време на ремонта.",
      en: "Milena turned our ideas into a clear concept and saved us many difficult decisions during renovation.",
    },
    name: "Петя и Ивайло",
    location: { bg: "София", en: "Sofia" },
  },
  {
    quote: {
      bg: "Визуализациите ни помогнаха да видим всяко решение и да планираме бюджета си уверено.",
      en: "The visualizations helped us see every decision and plan our budget with confidence.",
    },
    name: "Петър",
    location: { bg: "Велико Търново", en: "Veliko Tarnovo" },
  },
  {
    quote: {
      bg: "Прецизен процес, чудесна комуникация и дом, който наистина се усеща като наш.",
      en: "A precise process, excellent communication, and a home that truly feels like ours.",
    },
    name: "Диляна",
    location: { bg: "Плевен", en: "Pleven" },
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Интериорен дизайн и 3D визуализации | FORMAE by Milena" },
      { name: "description", content: "Интериорен дизайн, 2D разпределения и фотореалистични 3D визуализации за апартаменти в София и България от FORMAE by Milena." },
      { name: "keywords", content: "интериорен дизайн, 3D визуализации, 2D разпределение, дизайн на апартамент, интериорен дизайнер София, interior design Bulgaria, 3D visualization Sofia" },
      { property: "og:title", content: "FORMAE by Milena | Интериорен дизайн и 3D визуализации" },
      { property: "og:description", content: "Вижте своя дом предварително с интериорна концепция, функционално 2D планиране и реалистична 3D визуализация." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const [language, setLanguage] = useState<Language>("bg");
  const [filter, setFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    ["about", { bg: "За нас", en: "About" }],
    ["services", { bg: "Услуги", en: "Services" }],
    ["process", { bg: "Процес", en: "Process" }],
    ["projects", { bg: "Проекти", en: "Projects" }],
    ["contact", { bg: "Контакт", en: "Contact" }],
  ] as const;

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-hero-foreground/15 bg-hero/90 text-hero-foreground backdrop-blur-md">
        <div className="mx-auto grid h-20 max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center px-5 sm:px-8 lg:grid-cols-[auto_1fr_auto] lg:px-12">
          <button onClick={() => goTo("home")} className="w-fit" aria-label="FORMAE home">
            <img src={headerLogo.url} alt="FORMAE by Milena" width={500} height={500} className="h-14 w-24 object-contain object-left sm:w-28" />
          </button>
          <nav className="mx-auto hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            {nav.map(([id, label]) => (
              <button key={id} onClick={() => goTo(id)} className="nav-link text-[11px] uppercase tracking-[0.17em] text-hero-foreground/75">
                {t(label, language)}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-hero-foreground/25 p-1" aria-label="Language">
              {(["bg", "en"] as const).map((lang) => (
                <button key={lang} onClick={() => setLanguage(lang)} className={`px-2.5 py-1 text-[10px] font-semibold uppercase transition-colors ${language === lang ? "bg-sage text-primary-foreground" : "text-hero-foreground/60"}`} aria-pressed={language === lang}>
                  {lang}
                </button>
              ))}
            </div>
            <button className="grid size-10 place-items-center lg:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-hero-foreground/15 bg-hero px-5 py-5 lg:hidden">
            {nav.map(([id, label]) => <button key={id} onClick={() => goTo(id)} className="block w-full border-b border-hero-foreground/10 py-3 text-left text-sm uppercase tracking-[0.14em]">{t(label, language)}</button>)}
          </nav>
        )}
      </header>

      <section id="home" className="relative min-h-[92svh] bg-hero text-hero-foreground">
        <img src={heroImage} alt={language === "bg" ? "Модерен интериор на градски апартамент" : "Modern city apartment interior"} width={1920} height={1280} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto flex min-h-[92svh] max-w-[1440px] items-end px-5 pb-16 pt-36 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
          <div className="max-w-4xl">
            <p className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.26em] text-hero-foreground/75"><span className="h-px w-10 bg-sage" /> Interior design · 2D · 3D</p>
             <h1 className="max-w-4xl font-accent text-5xl leading-[1.06] sm:text-6xl lg:text-7xl xl:text-8xl">
              {language === "bg" ? "Виж дома си, преди да започнеш да го създаваш." : "See your home before you start creating it."}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-hero-foreground/78 sm:text-lg">
              {language === "bg" ? "Интериорни проекти, 2D разпределения и 3D визуализации, които ви помагат да вземате уверени решения за своя дом." : "Interior concepts, 2D layouts and realistic 3D visualizations that help you make confident decisions for your home."}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => goTo("contact")} className="h-13 rounded-none px-7 uppercase tracking-[0.12em]">{language === "bg" ? "Свържи се с нас" : "Contact us"}<ArrowRight /></Button>
              <Button size="lg" variant="heroOutline" onClick={() => goTo("projects")} className="h-13 rounded-none px-7 uppercase tracking-[0.12em]">{language === "bg" ? "Разгледай проектите" : "View portfolio"}</Button>
            </div>
          </div>
          <button onClick={() => goTo("about")} className="absolute bottom-8 right-5 hidden items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-hero-foreground/60 md:flex lg:right-12">
            {language === "bg" ? "Открий повече" : "Discover more"}<ArrowDown className="size-4" />
          </button>
        </div>
      </section>

      <section id="about" className="section-space">
        <div className="section-grid">
          <div>
            <p className="eyebrow">01 — {language === "bg" ? "За FORMAE" : "About FORMAE"}</p>
             <h2 className="section-title mt-6"><span className="font-accent">{language === "bg" ? "Идеята става пространство." : "An idea becomes a space."}</span></h2>
          </div>
          <div className="lg:pt-14">
            <p className="text-xl leading-9 text-foreground/85 sm:text-2xl">
              {language === "bg" ? "FORMAE by Milena създава интериорни концепции и визуализации, които превръщат идеите в ясни, реалистични пространства още преди реализацията." : "FORMAE by Milena creates interior concepts and visualizations that transform ideas into clear, realistic spaces before implementation."}
            </p>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-7 text-sm sm:grid-cols-3">
              {[{bg:"Яснота",en:"Clarity"},{bg:"Функционалност",en:"Function"},{bg:"Естетика",en:"Aesthetics"},{bg:"Личен подход",en:"Personal approach"},{bg:"Професионална визия",en:"Professional vision"}].map((item) => <div key={item.en} className="flex items-center gap-2"><span className="size-1.5 bg-sage" />{t(item, language)}</div>)}
            </div>
            <div className="mt-12 flex items-center gap-5">
              <div className="grid size-14 shrink-0 place-items-center rounded-full border border-sage text-sage"><Sparkles className="size-5" /></div>
              <div><p className="font-display text-xl">Milena Gabrova</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">Interior Designer & Visualization Specialist</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="section-space bg-surface">
        <div className="content-wrap">
          <div className="section-heading"><div><p className="eyebrow">02 — {language === "bg" ? "Услуги" : "Services"}</p><h2 className="section-title mt-5">{language === "bg" ? "От първата линия до ясната картина." : "From the first line to the full picture."}</h2></div><p className="max-w-md text-sm leading-7 text-muted-foreground">{language === "bg" ? "Процес, който дава увереност преди всяка инвестиция в ремонт, материали и обзавеждане." : "A process that gives you confidence before every investment in renovation, materials, and furniture."}</p></div>
          <div className="mt-14 grid border-l border-t border-border md:grid-cols-2 xl:grid-cols-4">
            {services.map((service, index) => { const Icon = service.icon; return (
              <article key={service.title.en} className={`group relative min-h-80 border-b border-r border-border p-7 transition-colors duration-500 ${service.featured ? "bg-primary text-primary-foreground" : "bg-background hover:bg-secondary"}`}>
                <div className="flex items-start justify-between"><span className={`text-xs ${service.featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}>0{index + 1}</span><Icon className="size-7 stroke-[1.3]" /></div>
                <div className="absolute inset-x-7 bottom-8"><h3 className="font-display text-3xl leading-tight">{t(service.title, language)}</h3><p className={`mt-4 text-sm leading-6 ${service.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{t(service.description, language)}</p></div>
              </article>
            ); })}
          </div>
        </div>
      </section>

      <section id="process" className="section-space bg-espresso text-hero-foreground">
        <div className="content-wrap">
          <p className="eyebrow text-sage-light">03 — {language === "bg" ? "Как работим" : "Our Process"}</p>
          <h2 className="section-title mt-5 max-w-3xl">{language === "bg" ? "Четири стъпки. Една ясна посока." : "Four steps. One clear direction."}</h2>
          <div className="mt-16 grid md:grid-cols-4">
             {[{bg:"Консултация",en:"Consultation"},{bg:"Създаване на концепция",en:"Concept Creation"},{bg:"2D планиране",en:"2D Planning"},{bg:"3D визуализация",en:"3D Visualization"}].map((step,index) => (
               <div key={step.en} className={`process-step process-reveal process-delay-${index + 1}`}><div className="mb-8 flex items-center"><span className="grid size-10 place-items-center rounded-full border border-sage text-xs text-sage-light transition-colors duration-500 hover:bg-sage hover:text-primary-foreground">{index + 1}</span><div className="h-px flex-1 origin-left bg-hero-foreground/20 transition-transform duration-700" /></div><h3 className="font-display text-2xl">{t(step, language)}</h3><p className="mt-3 text-sm leading-6 text-hero-foreground/55">{language === "bg" ? ["Опознаваме вас, пространството и приоритетите ви.","Определяме стил, атмосфера, цветове и материали.","Подреждаме функциите и мебелите с точност.","Виждате бъдещия си дом преди реализацията."][index] : ["We understand you, your space, and your priorities.","We define the style, atmosphere, colors, and materials.","We arrange function and furniture with precision.","You see your future home before implementation."][index]}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="section-space">
        <div className="content-wrap">
          <div className="section-heading items-end"><div><p className="eyebrow">04 — {language === "bg" ? "Проекти" : "Projects"}</p><h2 className="section-title mt-5">{language === "bg" ? "Пространства с характер." : "Spaces with character."}</h2></div><p className="max-w-sm text-sm leading-7 text-muted-foreground">{language === "bg" ? "Подбрани концепции за реални градски домове — красиви, функционални и постижими." : "Selected concepts for real city homes — beautiful, functional, and attainable."}</p></div>
          <div className="mt-10 flex gap-2 overflow-x-auto pb-2" aria-label="Project filters">
            {filters.map((item) => <Button key={item.key} size="sm" variant={filter === item.key ? "default" : "filter"} onClick={() => setFilter(item.key)} className="shrink-0 rounded-none">{t(item.label, language)}</Button>)}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {projects.filter((project) => filter === "all" || project.category === filter).map((project, index) => (
              <article key={project.title.en} className={`project-card group ${index === 0 && filter === "all" ? "md:col-span-2" : ""}`}>
                <img src={project.image} alt={t(project.title, language)} width={index === 0 ? 1920 : 1408} height={index === 0 ? 1280 : 1056} loading="lazy" className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] ${index === 0 && filter === "all" ? "aspect-[16/9]" : "aspect-[4/3]"}`} />
                <div className="absolute inset-0 bg-project-overlay opacity-70 transition-opacity group-hover:opacity-90" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-hero-foreground sm:p-8"><div><p className="text-[10px] uppercase tracking-[0.2em] text-hero-foreground/65">{project.location}</p><h3 className="mt-2 font-display text-3xl sm:text-4xl">{t(project.title, language)}</h3></div><span className="grid size-11 place-items-center rounded-full border border-hero-foreground/40"><ArrowRight className="size-4" /></span></div>
              </article>
            ))}
            {filter === "home" && <div className="col-span-full border border-dashed border-border px-6 py-20 text-center"><BedDouble className="mx-auto size-8 text-sage"/><p className="mt-5 font-display text-2xl">{language === "bg" ? "Скоро ще добавим цялостни проекти" : "Full home concepts coming soon"}</p></div>}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-sage py-24 text-primary-foreground sm:py-32">
        <div className="absolute -right-20 -top-20 size-96 rounded-full border border-primary-foreground/15" /><div className="absolute -right-5 top-10 size-72 rounded-full border border-primary-foreground/15" />
        <div className="content-wrap relative grid items-center gap-12 lg:grid-cols-[1fr_260px]">
           <blockquote className="max-w-4xl font-accent text-4xl leading-tight sm:text-5xl lg:text-6xl">“{language === "bg" ? "Красотата е в детайлите. А детайлите никога не са случайни." : "Beauty is found in the details. And details are never left to chance."}”</blockquote>
          <img src={beigeLogo.url} alt="FORMAE by Milena" width={500} height={500} loading="lazy" className="mx-auto w-48 opacity-90 lg:w-64" />
        </div>
      </section>

      <section className="section-space bg-surface">
        <div className="content-wrap">
          <p className="eyebrow">05 — {language === "bg" ? "Отзиви" : "Testimonials"}</p><h2 className="section-title mt-5">{language === "bg" ? "Доверието се изгражда в процеса." : "Trust is built in the process."}</h2>
          <div className="mt-12 grid gap-px bg-border md:grid-cols-3">
             {testimonials.map((testimonial) => <article key={testimonial.name} className="bg-background p-8 sm:p-10"><p className="font-accent text-5xl text-sage/50">“</p><p className="mt-6 text-base leading-7 text-foreground/80">{t(testimonial.quote, language)}</p><div className="mt-8 border-t border-border pt-5"><p className="text-sm font-medium">{testimonial.name}</p><p className="mt-1 text-xs text-muted-foreground">{t(testimonial.location, language)}</p></div></article>)}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-espresso text-hero-foreground">
        <div className="grid lg:grid-cols-2">
          <div className="px-5 py-20 sm:px-10 sm:py-24 lg:px-16 xl:px-24">
            <p className="eyebrow text-sage-light">06 — {language === "bg" ? "Контакт" : "Contact"}</p>
            <h2 className="mt-6 max-w-2xl font-display text-5xl leading-tight sm:text-6xl">{language === "bg" ? "Нека поговорим за вашия проект." : "Let's talk about your project."}</h2>
            <p className="mt-6 max-w-xl leading-7 text-hero-foreground/60">{language === "bg" ? "Разкажете ни за вашето пространство. Ще обсъдим нуждите, възможностите и най-добрата следваща стъпка." : "Tell us about your space. We’ll discuss your needs, possibilities, and the best next step."}</p>
            <Button asChild size="lg" className="mt-9 h-13 rounded-none px-7 uppercase tracking-[0.12em]"><a href="mailto:formae.by.milena@gmail.com">{language === "bg" ? "Изпрати запитване" : "Send an inquiry"}<ArrowRight /></a></Button>
          </div>
          <div className="border-t border-hero-foreground/15 bg-hero-foreground/5 px-5 py-16 sm:px-10 lg:border-l lg:border-t-0 lg:px-16 lg:py-24">
            <p className="font-display text-2xl">Milena Gabrova</p><p className="mt-1 text-xs uppercase tracking-[0.15em] text-hero-foreground/50">Interior Designer & Visualization Specialist</p>
            <div className="mt-10 divide-y divide-hero-foreground/15 border-y border-hero-foreground/15">
              <ContactLink icon={Phone} label={language === "bg" ? "Телефон" : "Phone"} value="088 352 2459" href="tel:+359883522459" />
              <ContactLink icon={Mail} label="Email" value="formae.by.milena@gmail.com" href="mailto:formae.by.milena@gmail.com" />
              <ContactLink icon={Instagram} label="Instagram" value="@formae.by.milena" href="https://www.instagram.com/formae.by.milena" />
              <ContactLink icon={Facebook} label="Facebook" value="FORMAE by Milena" href="https://www.facebook.com/FORMAE.by.Milena" />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-footer px-5 py-12 text-footer-foreground sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div><img src={beigeLogo.url} alt="FORMAE by Milena" width={500} height={500} loading="lazy" className="w-36" /><p className="mt-3 text-xs uppercase tracking-[0.25em] text-footer-foreground/55">Design Your Life</p></div>
          <div className="space-y-2 text-sm text-footer-foreground/65 md:text-right"><a href="tel:+359883522459" className="block hover:text-footer-foreground">088 352 2459</a><a href="mailto:formae.by.milena@gmail.com" className="block hover:text-footer-foreground">formae.by.milena@gmail.com</a><p className="pt-4 text-xs">© {new Date().getFullYear()} FORMAE by Milena</p></div>
        </div>
      </footer>

      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2">
        <a href="viber://chat?number=%2B359883522459" aria-label="Contact on Viber" title="Viber" className="contact-float bg-viber"><Phone /></a>
        <a href="https://wa.me/359883522459" target="_blank" rel="noreferrer" aria-label="Contact on WhatsApp" title="WhatsApp" className="contact-float bg-whatsapp"><MessageCircle /></a>
      </div>
    </main>
  );
}

function ContactLink({ icon: Icon, label, value, href }: { icon: typeof Phone; label: string; value: string; href: string }) {
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-5"><Icon className="size-5 text-sage-light" /><div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.18em] text-hero-foreground/40">{label}</p><p className="mt-1 truncate text-sm sm:text-base">{value}</p></div><ChevronRight className="size-4 text-hero-foreground/35 transition-transform group-hover:translate-x-1" /></a>;
}