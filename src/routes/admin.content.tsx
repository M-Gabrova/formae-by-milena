import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/content")({
  head: () => ({
    meta: [
      { title: "Content | FORMAE Admin" },
      { name: "description", content: "Website content management (coming later)." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Content | FORMAE Admin" },
      { property: "og:description", content: "Website content management (coming later)." },
    ],
  }),
  component: () => (
    <div className="max-w-2xl space-y-3">
      <h1 className="font-display text-3xl">Съдържание / Content</h1>
      <p className="text-muted-foreground">
        Редакцията на текстовете на сайта ще бъде добавена в следващ етап. / Editing website texts will be added in a later phase.
      </p>
    </div>
  ),
});
