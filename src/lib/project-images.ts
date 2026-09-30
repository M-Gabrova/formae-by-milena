// Shared helpers for the private `project-images` bucket (reused by Batch 3).
import { supabase } from "@/integrations/supabase/client";

export const PROJECT_IMAGES_BUCKET = "project-images";
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export function projectFolder(projectId: string) {
  return `projects/${projectId}`;
}

export function buildImagePath(projectId: string, fileName: string) {
  const dot = fileName.lastIndexOf(".");
  const ext = dot > -1 ? fileName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const base = (dot > -1 ? fileName.slice(0, dot) : fileName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "image";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${projectFolder(projectId)}/${Date.now()}-${rand}-${base}.${ext}`;
}

/** Signed (temporary) URLs for private images. Returns map path -> url. */
export async function getSignedImageUrls(paths: string[], expiresIn = 3600) {
  const out: Record<string, string> = {};
  if (paths.length === 0) return out;
  const { data, error } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .createSignedUrls(paths, expiresIn);
  if (error) throw error;
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) out[item.path] = item.signedUrl;
  }
  return out;
}

/** Upload with progress via the Storage REST API using the user's session token (RLS applies). */
export async function uploadImageWithProgress(
  path: string,
  file: File,
  onProgress: (pct: number) => void,
) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Сесията изтече. Влезте отново. / Session expired, please sign in again.");
  const url = `${import.meta.env['VITE_SUPABASE_URL']}/storage/v1/object/${PROJECT_IMAGES_BUCKET}/${path}`;
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY']);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        let msg = `Upload failed (${xhr.status})`;
        try { msg = JSON.parse(xhr.responseText).message ?? msg; } catch { /* ignore */ }
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

/** Deletes every object under projects/{id}/. Throws on failure. */
export async function deleteProjectFolder(projectId: string) {
  const folder = projectFolder(projectId);
  const { data, error } = await supabase.storage.from(PROJECT_IMAGES_BUCKET).list(folder, { limit: 1000 });
  if (error) throw error;
  const paths = (data ?? []).map((f) => `${folder}/${f.name}`);
  if (paths.length === 0) return;
  const { data: removed, error: rmError } = await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove(paths);
  if (rmError) throw rmError;
  if ((removed ?? []).length < paths.length) throw new Error("Some files could not be deleted from storage.");
}
