import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { ProfileFields } from "@/components/profile-fields";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { emptyProfile, type MemberProfile } from "@/data/profile";
import { loadProfile, saveProfile } from "@/lib/server/profile";

export const Route = createFileRoute("/induction")({ component: InductionPage });

function InductionPage() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [profile, setProfile] = useState<MemberProfile>(emptyProfile);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isPending || !user) return;
    loadProfile()
      .then((data) => {
        const next = { ...data };
        if (!next.givenName && user.displayName) next.givenName = user.displayName;
        setProfile(next);
        setReady(true);
      })
      .catch(() => {
        setProfile({
          ...emptyProfile(),
          givenName: user.displayName ?? "",
        });
        setReady(true);
      });
  }, [isPending, user]);

  if (isPending || (user && !ready)) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl px-5 py-24">
          <div className="h-10 w-48 animate-pulse rounded-md bg-elevated" />
          <div className="mt-8 h-64 animate-pulse rounded-xl bg-surface" />
        </div>
      </PageShell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile.givenName.trim()) {
      toast.error("A name is required.");
      return;
    }
    setBusy(true);
    try {
      await saveProfile({ data: { ...profile, givenName: profile.givenName.trim() } });
      toast.success("Dossier filed. Counsel will remember.");
      await navigate({ to: "/correspondence" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-xl px-5 py-16 sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Induction</p>
        <h1 className="mt-3 font-display text-4xl text-fg">How shall we know you?</h1>
        <p className="mt-4 text-sm text-muted">
          Name is required. The rest is optional and becomes Counsel’s working memory — seat,
          struggles, and the work you already do well.
        </p>
        <form onSubmit={(e) => void onSave(e)} className="mt-10 space-y-6">
          <ProfileFields value={profile} onChange={setProfile} nameRequired />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Filing…" : "File the dossier"}
            </Button>
            <Button type="button" variant="ghost" asChild>
              <Link to="/correspondence">Skip for now</Link>
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
