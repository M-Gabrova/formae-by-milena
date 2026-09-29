CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_bg text NOT NULL,
  title_en text NOT NULL,
  description_bg text,
  description_en text,
  category text,
  area_m2 numeric(8,2),
  location text,
  completion_year integer,
  design_style text,
  client_tags text[],
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX projects_status_order_idx ON public.projects (status, display_order);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published projects" ON public.projects FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins read all projects" ON public.projects FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  caption_bg text,
  caption_en text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX project_images_project_order_idx ON public.project_images (project_id, display_order);
GRANT SELECT ON public.project_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_images TO authenticated;
GRANT ALL ON public.project_images TO service_role;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads images of published projects" ON public.project_images FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.status = 'published'));
CREATE POLICY "Admins read all images" ON public.project_images FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert images" ON public.project_images FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update images" ON public.project_images FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete images" ON public.project_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read project-images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'project-images');
CREATE POLICY "Admins upload project-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update project-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete project-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));