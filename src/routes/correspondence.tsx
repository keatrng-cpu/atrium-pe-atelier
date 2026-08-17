import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, PageShell } from "@/components/page-shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listCorrespondence, type CorrespondenceRow } from "@/lib/server/atelier";
import { getLetter } from "@/data/letters";

export const Route = createFileRoute("/correspondence")({
  component: CorrespondencePage,
});

function CorrespondencePage() {
  const { user, isPending } = useCurrentUserState();
  const [rows, setRows] = useState<CorrespondenceRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || !user) return;
    let cancelled = false;
    listCorrespondence()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch(() => {
        if (!cancelled) setError("The tray could not be opened.");
      });
    return () => {
      cancelled = true;
    };
  }, [isPending, user]);

  if (isPending) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-5 py-24">
          <div className="h-10 w-48 animate-pulse rounded-md bg-elevated" />
          <div className="mt-8 space-y-3">
            <div className="h-24 animate-pulse rounded-xl bg-surface" />
            <div className="h-24 animate-pulse rounded-xl bg-surface" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!user) return <RedirectToSignIn />;

  return (
    <PageShell>
      <PageIntro
        kicker="Correspondence"
        title="Letters on cream stock."
        lede={`Addressed to ${user.displayName ?? user.primaryEmail ?? "you"}. Open each in turn. They are part of the curriculum, not decoration.`}
      />
      <section className="mx-auto max-w-3xl space-y-3 px-5 pb-24 sm:px-8">
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {rows?.map((row) => {
          const letter = getLetter(row.letterKey);
          return (
            <Link
              key={row.id}
              to="/correspondence/$id"
              params={{ id: row.id }}
              className="block rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)] sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">
                    {letter?.kicker ?? "Letter"}
                    {row.openedAt ? " · Opened" : " · Unopened"}
                  </p>
                  <h2 className="mt-2 font-display text-2xl text-fg">{row.subject}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {letter ? `${letter.fromName}, ${letter.fromTitle}` : "Atrium"}
                  </p>
                </div>
                <span
                  className={
                    row.openedAt
                      ? "mt-1 size-2 shrink-0 rounded-full bg-subtle"
                      : "mt-1 size-2 shrink-0 rounded-full bg-accent"
                  }
                />
              </div>
            </Link>
          );
        })}
      </section>
    </PageShell>
  );
}
