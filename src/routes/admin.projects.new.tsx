import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProjectForm, type ProjectFormValues } from "@/components/admin/ProjectForm";
import { friendlyError } from "@/lib/admin-projects";

export const Route = createFileRoute("/admin/projects/new")({
  head: () => ({
    meta: [
      { title: "New project | FORMAE Admin" },
      { name: "description", content: "Create a new portfolio project." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "New project | FORMAE Admin" },
      { property: "og:description", content: "Create a new portfolio project." },
    ],
  }),
  component: NewProject,
});

function NewProject() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(values: ProjectFormValues) {
    setSaving(true);
    setError(null);
    const { data, error } = await supabase.from("projects").insert(values).select("id").single();
    setSaving(false);
    if (error) {
      const msg = `Създаването не успя / Create failed: ${friendlyError(error)}`;
      setError(msg);
      toast.error(msg);
      return;
    }
    toast.success("Проектът е създаден. Добавете снимки. / Project created — now add images.");
    navigate({ to: "/admin/projects/$id", params: { id: data.id } });
  }

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="font-display text-3xl">Нов проект / New project</h1>
      <ProjectForm saving={saving} serverError={error} onSubmit={onSubmit} />
      <p className="text-sm text-muted-foreground">Снимките се добавят след първото запазване. / Images can be added after the first save.</p>
    </div>
  );
}
