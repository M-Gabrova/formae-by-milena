DROP POLICY IF EXISTS "Public read project-images" ON storage.objects;

CREATE POLICY "Public read published project images" ON storage.objects
FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'project-images'
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.status = 'published'
      AND p.id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Admins read all project-images" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));