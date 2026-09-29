import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin login | FORMAE by Milena" },
      { name: "description", content: "Private admin sign-in for FORMAE by Milena." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin login | FORMAE by Milena" },
      { property: "og:description", content: "Private admin sign-in for FORMAE by Milena." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Грешен имейл или парола. / Invalid email or password.");
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6 border border-border bg-card p-8">
        <div className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">FORMAE by Milena</p>
          <h1 className="text-2xl text-foreground">Admin</h1>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "…" : "Вход / Sign in"}
        </Button>
      </form>
    </main>
  );
}
