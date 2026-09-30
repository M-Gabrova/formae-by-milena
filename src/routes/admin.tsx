import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { FolderKanban, Plus, FileText, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
    // Informational only — the database RLS policies are the real authority.
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    return { email: data.user.email ?? "", isAdmin };
  },
  head: () => ({
    meta: [
      { title: "Admin | FORMAE by Milena" },
      { name: "description", content: "FORMAE by Milena private admin area." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin | FORMAE by Milena" },
      { property: "og:description", content: "FORMAE by Milena private admin area." },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Проекти / Projects", icon: FolderKanban, exact: true },
  { to: "/admin/projects/new", label: "Нов проект / Add project", icon: Plus, exact: false },
  { to: "/admin/content", label: "Съдържание / Content", icon: FileText, exact: false },
] as const;

function AdminLayout() {
  const { email, isAdmin } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/admin/login", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md space-y-4 border border-border bg-card p-8 text-center">
          <h1 className="text-2xl text-foreground">Нямате достъп / No admin access</h1>
          <p className="text-sm text-muted-foreground">Signed in as {email}</p>
          <Button variant="outline" onClick={signOut}>Изход / Sign out</Button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-border bg-card lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 p-4 lg:block lg:p-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">FORMAE by Milena</p>
            <p className="font-display text-xl">Admin</p>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={signOut}><LogOut /> Изход</Button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="flex shrink-0 items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-muted text-foreground" }}
            >
              <item.icon className="size-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-border p-6 lg:absolute lg:bottom-0 lg:block lg:w-full">
          <p className="truncate text-xs text-muted-foreground" title={email}>{email}</p>
          <Button variant="outline" size="sm" className="mt-3 w-full" onClick={signOut}><LogOut /> Изход / Logout</Button>
        </div>
      </aside>
      <main className="min-w-0 p-4 sm:p-6 lg:p-10">
        <p className="mb-4 truncate text-xs text-muted-foreground lg:hidden">{email}</p>
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
