// TEMPORARY placeholder for Batch 1 — the real dashboard comes in Batch 2.
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
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
  component: AdminPlaceholder,
});

function AdminPlaceholder() {
  const { email, isAdmin } = Route.useRouteContext();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md space-y-4 border border-border bg-card p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Temporary placeholder</p>
        <h1 className="text-2xl text-foreground">
          {isAdmin ? "Admin — coming soon" : "No admin access"}
        </h1>
        <p className="text-sm text-muted-foreground">Signed in as {email}</p>
        <Button variant="outline" onClick={signOut}>Изход / Sign out</Button>
      </div>
    </main>
  );
}
