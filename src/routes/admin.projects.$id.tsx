import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProjectForm, type ProjectFormValues } from "@/components/admin/ProjectForm";
import { ImageManager } from "@/components/admin/ImageManager";
import { fetchProject, friendlyError } from "@/lib/admin-projects";

export const Route = createFileRoute("/admin/projects/$id")({
  head: () => ({
    meta: [
      { title: "Edit project | FORMAE Admin" },
      { name: "description", content: "Edit a portfolio project." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Edit project | FORMAE Admin" },
      { property: "og:description", content: "Edit a portfolio project." },
    ],
  }),
  component: EditProject,
});

function EditProject() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const project = useQuery({ queryKey: ["admin-project", id], queryFn: () => fetchProject(id) });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(values: ProjectFormValues) {
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("projects").update(values).eq("id", id);
    setSaving(false);
    if (error) {
      const msg = `Запазването не успя / Update failed: ${friendlyError(error)}`;
      setError(msg);
      toast.error(msg);
      return;
    }
    toast.success(values.status === "published" ? "Запазено и публикувано / Saved & published" : "Запазено като чернова / Saved as draft");
    qc.invalidateQueries({ queryKey: ["admin-project", id] });
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
  }

  if (project.isLoading) return <p className="text-muted-foreground">Зареждане… / Loading…</p>;
  if (project.error) return <p className="text-destructive">{friendlyError(project.error)}</p>;
  if (!project.data) return <p>Проектът не е намерен. / Project not found.</p>;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Проекти</Link>
          <h1 className="font-display text-3xl">{project.data.title_bg}</h1>
        </div>
        <Button variant="outline" asChild><Link to="/admin/projects/$id/preview" params={{ id }}><Eye /> Преглед / Preview</Link></Button>
      </div>
      <ProjectForm key={project.data.updated_at} initial={project.data} saving={saving} serverError={error} onSubmit={onSubmit} />
      <ImageManager projectId={id} />
    </div>
  );
}
