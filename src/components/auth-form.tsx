import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Letter } from "@/components/letter";
import { ProfileFields } from "@/components/profile-fields";
import { letterTemplates } from "@/data/letters";
import { emptyProfile, type MemberProfile } from "@/data/profile";
import { saveProfile } from "@/lib/server/profile";
import { cn } from "@/lib/utils";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<MemberProfile>(emptyProfile);
  const [busy, setBusy] = useState(false);
  const isJoin = mode === "signup";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authEnabled) return;
    setBusy(true);
    try {
      if (isJoin) {
        const given = profile.givenName.trim();
        if (!given) throw new Error("A name is required.");
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: given,
        });
        if (error) throw new Error(error.message ?? "Could not open the account");
        try {
          await saveProfile({ data: { ...profile, givenName: given } });
        } catch {
          // Account exists; the dossier can be finished in the studio.
        }
        toast.success("Welcome. Counsel will remember this dossier.");
        await navigate({ to: "/correspondence" });
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message ?? "Could not sign in");
        toast.success("Welcome back.");
        await navigate({ to: "/studio" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative order-2 overflow-hidden bg-surface lg:sticky lg:top-0 lg:order-1 lg:h-dvh">
        <img
          src="/images/letter.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
        <div className="relative flex min-h-[18rem] items-center justify-center p-6 sm:p-10 lg:h-full lg:min-h-0 lg:p-12">
          <Letter
            letter={letterTemplates[0]}
            dateLabel="Upon election"
            className="max-w-lg animate-[letter-open_600ms_var(--ease-smooth-out)]"
          />
        </div>
      </div>

      <div className="order-1 flex flex-col justify-center bg-bg px-6 py-16 sm:px-12 lg:order-2">
        <div className={cn("mx-auto w-full", isJoin ? "max-w-md" : "max-w-sm")}>
          <Link to="/" className="font-display text-3xl text-fg">
            Atrium
          </Link>
          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-subtle">
            Private Equity Career Atelier
          </p>
          <h1 className="mt-10 font-display text-4xl text-fg">
            {isJoin ? "Request membership" : "Sign in"}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {isJoin
              ? "A name is required. Everything else is optional — it becomes Counsel’s memory of you."
              : "Members return to the studio, the desk, and the letter tray."}
          </p>

          {authEnabled ? (
            <>
              <div className="mt-8 grid gap-2">
                {GROK_PROVIDERS.map((p) => (
                  <Button
                    key={p.providerId}
                    type="button"
                    variant="outline"
                    onClick={() =>
                      void signIn(p.providerId, {
                        callbackURL: isJoin ? "/induction" : "/studio",
                      })
                    }
                  >
                    Continue with {p.label}
                  </Button>
                ))}
              </div>

              <div className="my-8 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-subtle">
                  or by letter
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
                {isJoin ? (
                  <ProfileFields value={profile} onChange={setProfile} nameRequired />
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@firm.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete={isJoin ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least eight characters"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "One moment…" : isJoin ? "Open the account" : "Enter"}
                </Button>
              </form>
            </>
          ) : (
            <p className="mt-8 text-sm text-muted">Sign-in is disabled.</p>
          )}

          <p className="mt-8 text-sm text-subtle">
            {isJoin ? (
              <>
                Already elected?{" "}
                <Link to="/login" className="text-fg underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to the atelier?{" "}
                <Link to="/signup" className="text-fg underline-offset-4 hover:underline">
                  Request membership
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
