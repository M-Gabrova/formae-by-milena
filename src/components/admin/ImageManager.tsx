import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { fetchImages, friendlyError, type ProjectImage } from "@/lib/admin-projects";
import {
  MAX_IMAGE_BYTES, PROJECT_IMAGES_BUCKET, buildImagePath, getSignedImageUrls, uploadImageWithProgress,
} from "@/lib/project-images";

type Pending = { key: string; name: string; pct: number; error?: string };

export function ImageManager({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<Pending[]>([]);
  const [busy, setBusy] = useState(false);
  const key = ["admin-images", projectId];
  const images = useQuery({ queryKey: key, queryFn: () => fetchImages(projectId) });
  const urls = useQuery({
    queryKey: ["admin-image-urls", images.data?.map((i) => i.storage_path).join("|")],
    enabled: !!images.data,
    queryFn: () => getSignedImageUrls(images.data!.map((i) => i.storage_path)),
    staleTime: 30 * 60 * 1000,
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
  };

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    const valid = list.filter((f) => {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name}: не е изображение / not an image`); return false; }
      if (f.size > MAX_IMAGE_BYTES) { toast.error(`${f.name}: над 20MB / larger than 20MB`); return false; }
      return true;
    });
    if (!valid.length) return;
    let order = (images.data?.reduce((m, i) => Math.max(m, i.display_order), -1) ?? -1) + 1;
    const items = valid.map((f) => ({ key: `${f.name}-${Math.random()}`, name: f.name, pct: 0 }));
    setPending((p) => [...p, ...items]);
    let ok = 0;
    await Promise.all(valid.map(async (file, idx) => {
      const k = items[idx].key;
      const path = buildImagePath(projectId, file.name);
      const myOrder = order++;
      try {
        await uploadImageWithProgress(path, file, (pct) =>
          setPending((p) => p.map((x) => (x.key === k ? { ...x, pct } : x))));
        const { error } = await supabase.from("project_images").insert({ project_id: projectId, storage_path: path, display_order: myOrder });
        if (error) {
          await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([path]);
          throw error;
        }
        ok++;
        setPending((p) => p.filter((x) => x.key !== k));
      } catch (e) {
        setPending((p) => p.map((x) => (x.key === k ? { ...x, error: friendlyError(e) } : x)));
        toast.error(`Качването не успя / Upload failed: ${file.name}`);
      }
    }));
    if (ok) toast.success(`Качени ${ok} снимки / ${ok} image(s) uploaded`);
    refresh();
  }

  async function removeImage(img: ProjectImage) {
    if (!confirm("Изтриване на снимката? / Delete this image?")) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([img.storage_path]);
      if (error) throw error;
      if (!data?.length) throw new Error("Файлът не беше изтрит от хранилището / File was not deleted from storage");
      const { error: dbErr } = await supabase.from("project_images").delete().eq("id", img.id);
      if (dbErr) throw dbErr;
      toast.success("Снимката е изтрита / Image deleted");
    } catch (e) {
      toast.error(`Изтриването не успя / Image delete failed: ${friendlyError(e)}`);
    } finally {
      setBusy(false);
      refresh();
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const list = [...(images.data ?? [])];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    [list[index], list[j]] = [list[j], list[index]];
    setBusy(true);
    try {
      const results = await Promise.all(list.map((img, i) =>
        img.display_order === i ? null : supabase.from("project_images").update({ display_order: i }).eq("id", img.id)));
      const err = results.find((r) => r?.error)?.error;
      if (err) throw err;
    } catch (e) {
      toast.error(`Пренареждането не успя / Reorder failed: ${friendlyError(e)}`);
    } finally {
      setBusy(false);
      refresh();
    }
  }

  async function saveCaption(img: ProjectImage, field: "caption_bg" | "caption_en", value: string) {
    if ((img[field] ?? "") === value) return;
    const { error } = await supabase.from("project_images").update({ [field]: value.trim() || null }).eq("id", img.id);
    if (error) toast.error(friendlyError(error));
    else { toast.success("Надписът е запазен / Caption saved"); refresh(); }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  return (
    <section className="space-y-4 border border-border bg-card p-5 sm:p-6">
      <h2 className="font-display text-xl">Снимки / Images</h2>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed p-8 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
      >
        <Upload className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Плъзнете снимки тук / Drag & drop images here (max 20MB each)</p>
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>Избери файлове / Choose files</Button>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }} />
      </div>

      {pending.map((p) => (
        <div key={p.key} className="space-y-1">
          <div className="flex justify-between text-xs"><span className="truncate">{p.name}</span><span>{p.error ? "✕" : `${p.pct}%`}</span></div>
          {p.error ? (
            <div className="flex items-center justify-between text-xs text-destructive">
              <span>{p.error}</span>
              <button type="button" className="underline" onClick={() => setPending((x) => x.filter((y) => y.key !== p.key))}>OK</button>
            </div>
          ) : <Progress value={p.pct} />}
        </div>
      ))}

      {images.error && <p className="text-sm text-destructive">{friendlyError(images.error)}</p>}
      {urls.error && <p className="text-sm text-destructive">Прегледите не се заредиха / Previews failed to load</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.data?.map((img, i) => (
          <div key={img.id} className="space-y-2 border border-border bg-background p-2">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {urls.data?.[img.storage_path] && <img src={urls.data[img.storage_path]} alt={img.caption_en ?? ""} className="size-full object-cover" loading="lazy" />}
              {i === 0 && <span className="absolute left-2 top-2 bg-primary px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary-foreground">Корица / Cover</span>}
            </div>
            <Input placeholder="Надпис (BG)" defaultValue={img.caption_bg ?? ""} onBlur={(e) => saveCaption(img, "caption_bg", e.target.value)} />
            <Input placeholder="Caption (EN)" defaultValue={img.caption_en ?? ""} onBlur={(e) => saveCaption(img, "caption_en", e.target.value)} />
            <div className="flex justify-between">
              <div>
                <Button type="button" size="icon" variant="ghost" aria-label="Move earlier" disabled={busy || i === 0} onClick={() => move(i, -1)}><ArrowUp /></Button>
                <Button type="button" size="icon" variant="ghost" aria-label="Move later" disabled={busy || i === images.data.length - 1} onClick={() => move(i, 1)}><ArrowDown /></Button>
              </div>
              <Button type="button" size="icon" variant="ghost" aria-label="Delete image" disabled={busy} onClick={() => removeImage(img)}><Trash2 className="text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
      {images.data?.length === 0 && <p className="text-sm text-muted-foreground">Няма качени снимки. / No images yet.</p>}
    </section>
  );
}
