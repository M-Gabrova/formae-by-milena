import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Copy, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { categoryLabel, fetchProjects, friendlyError, uniqueSlug, type Project } from "@/lib/admin-projects";
import { deleteProjectFolder, getSignedImageUrls } from "@/lib/project-images";

export const Route = createFileRoute("/admin/")({
  component: ProjectList,
});

type Row = Awaited<ReturnType<typeof fetchProjects>>[number];

function coverPath(p: Row) {
  const imgs = [...(p.project_images ?? [])].sort((a, b) => a.display_order - b.display_order);
  return imgs[0]?.storage_path;
}

function ProjectList() {
  const qc = useQueryClient();
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const projects = useQuery({ queryKey: ["admin-projects"], queryFn: fetchProjects });
  const covers = useQuery({
    queryKey: ["admin-covers", projects.data?.map(coverPath).join("|")],
    enabled: !!projects.data,
    queryFn: () => getSignedImageUrls(projects.data!.map(coverPath).filter(Boolean) as string[]),
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-projects"] });

  const toggleStatus = useMutation({
    mutationFn: async (p: Project) => {
      const status = p.status === "published" ? "draft" : "published";
      const { error } = await supabase.from("projects").update({ status }).eq("id", p.id);
      if (error) throw error;
      return status;
    },
    onSuccess: (s) => { toast.success(s === "published" ? "Публикуван / Published" : "Чернова / Set to draft"); refresh(); },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const move = useMutation({
    mutationFn: async ({ index, dir }: { index: number; dir: -1 | 1 }) => {
      const list = [...(projects.data ?? [])];
      const j = index + dir;
      if (j < 0 || j >= list.length) return;
      [list[index], list[j]] = [list[j]!, list[index]!];
      const results = await Promise.all(
        list.map((p, i) => (p.display_order === i ? null : supabase.from("projects").update({ display_order: i }).eq("id", p.id))),
      );
      const err = results.find((r) => r?.error)?.error;
      if (err) throw err;
    },
    onSuccess: refresh,
    onError: (e) => { toast.error(`Неуспешно пренареждане / Reorder failed: ${friendlyError(e)}`); refresh(); },
  });

  const duplicate = useMutation({
    mutationFn: async (p: Project) => {
      const slug = await uniqueSlug(`${p.slug}-copy`);
      const { id: _id, created_at: _c, updated_at: _u, ...rest } = p;
      const { error } = await supabase.from("projects").insert({
        ...rest, slug, status: "draft", title_bg: `${p.title_bg} (копие)`, title_en: `${p.title_en} (copy)`,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Копиран като чернова / Duplicated as draft (images not copied)"); refresh(); },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const remove = useMutation({
    mutationFn: async (p: Project) => {
      await deleteProjectFolder(p.id);
      const { error } = await supabase.from("projects").delete().eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Проектът е изтрит / Project deleted"); setToDelete(null); refresh(); },
    onError: (e) => { toast.error(`Изтриването не успя / Delete failed: ${friendlyError(e)}`); setToDelete(null); },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Проекти / Projects</h1>
          <p className="text-sm text-muted-foreground">{projects.data?.length ?? 0} total</p>
        </div>
        <Button asChild><Link to="/admin/projects/new"><Plus /> Нов проект / Add project</Link></Button>
      </div>

      {projects.isLoading && <p className="text-muted-foreground">Зареждане… / Loading…</p>}
      {projects.error && <p className="text-destructive">{friendlyError(projects.error)}</p>}
      {projects.data?.length === 0 && (
        <div className="border border-dashed border-border p-10 text-center text-muted-foreground">
          Все още няма проекти. / No projects yet.
        </div>
      )}

      <div className="divide-y divide-border border border-border bg-card">
        {projects.data?.map((p, i) => {
          const cp = coverPath(p);
          const url = cp ? covers.data?.[cp] : undefined;
          return (
            <div key={p.id} className="grid gap-4 p-4 md:grid-cols-[80px_1fr_auto] md:items-center">
              <div className="aspect-[4/3] w-20 overflow-hidden bg-muted">
                {url && <img src={url} alt="" className="size-full object-cover" />}
              </div>
              <div className="min-w-0 space-y-1">
                <p className="truncate font-medium">{p.title_bg} <span className="text-muted-foreground">/ {p.title_en}</span></p>
                <p className="text-xs text-muted-foreground">
                  {categoryLabel(p.category)} · #{p.display_order} · {p.completion_year ?? "—"} · updated {new Date(p.updated_at).toLocaleDateString("bg-BG")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="mr-2 flex items-center gap-2 text-xs">
                  <Switch
                    checked={p.status === "published"}
                    disabled={toggleStatus.isPending}
                    onCheckedChange={() => toggleStatus.mutate(p)}
                    aria-label="Published"
                  />
                  <span className={p.status === "published" ? "text-primary" : "text-muted-foreground"}>
                    {p.status === "published" ? "Published" : "Draft"}
                  </span>
                </label>
                <Button size="icon" variant="ghost" aria-label="Move up" disabled={i === 0 || move.isPending} onClick={() => move.mutate({ index: i, dir: -1 })}><ArrowUp /></Button>
                <Button size="icon" variant="ghost" aria-label="Move down" disabled={i === projects.data.length - 1 || move.isPending} onClick={() => move.mutate({ index: i, dir: 1 })}><ArrowDown /></Button>
                <Button size="icon" variant="ghost" aria-label="Edit" asChild><Link to="/admin/projects/$id" params={{ id: p.id }}><Pencil /></Link></Button>
                <Button size="icon" variant="ghost" aria-label="Preview" asChild><Link to="/admin/projects/$id/preview" params={{ id: p.id }}><Eye /></Link></Button>
                <Button size="icon" variant="ghost" aria-label="Duplicate" disabled={duplicate.isPending} onClick={() => duplicate.mutate(p)}><Copy /></Button>
                <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => setToDelete(p)}><Trash2 className="text-destructive" /></Button>
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && !remove.isPending && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на проект? / Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              „{toDelete?.title_bg}“ и всички негови снимки ще бъдат изтрити завинаги. / This project and all its images will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Отказ / Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              onClick={(e) => { e.preventDefault(); if (toDelete) remove.mutate(toDelete); }}
            >
              {remove.isPending ? "Изтриване… / Deleting…" : "Изтрий / Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
