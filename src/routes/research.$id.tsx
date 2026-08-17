import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { BriefView } from "@/components/research/brief-view";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getBrief, publishBrief, type ResearchBrief } from "@/lib/server/research";

export const Route = createFileRoute("/research/$id")({ component: BriefPage });

function BriefPage() {
  const { id } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (isPending || !user) return;
    getBrief({ data: { id } })
      .then(setBrief)
      .catch((err) => setError(err instanceof Error ? err.message : "Not found"));
  }, [id, isPending, user]);

  if (isPending || (user && !brief && !error)) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-5 py-24">
          <div className="h-10 w-64 animate-pulse rounded-md bg-elevated" />
          <div className="mt-8 h-80 animate-pulse rounded-xl bg-surface" />
        </div>
      </PageShell>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (error || !brief) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl px-5 py-24">
          <p className="text-muted">{error ?? "Brief not found."}</p>
          <Link to="/research" className="mt-4 inline-block text-accent">
            Research desk
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        {brief.status !== "published" ? (
          <div className="mb-10 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-5 py-4 shadow-[var(--shadow-border)]">
            <p className="text-sm text-muted">
              Review grade: {brief.review.grade}. Publish only if you will stand behind it.
            </p>
            <Button
              type="button"
              disabled={publishing}
              onClick={() => {
                setPublishing(true);
                void publishBrief({ data: { id } })
                  .then(() => getBrief({ data: { id } }))
                  .then(setBrief)
                  .then(() => toast.success("Circulated."))
                  .catch((err) =>
                    toast.error(err instanceof Error ? err.message : "Could not publish"),
                  )
                  .finally(() => setPublishing(false));
              }}
            >
              {publishing ? "Publishing…" : "Publish to the book"}
            </Button>
          </div>
        ) : null}
        <BriefView brief={brief} />
      </div>
    </PageShell>
  );
}
