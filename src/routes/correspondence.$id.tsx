import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Letter } from "@/components/letter";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  listCorrespondence,
  markLetterOpened,
  type CorrespondenceRow,
} from "@/lib/server/atelier";
import { getLetter } from "@/data/letters";

export const Route = createFileRoute("/correspondence/$id")({
  component: LetterPage,
});

function LetterPage() {
  const { id } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const [row, setRow] = useState<CorrespondenceRow | null | undefined>(undefined);

  useEffect(() => {
    if (isPending || !user) return;
    let cancelled = false;
    listCorrespondence()
      .then((rows) => {
        if (cancelled) return;
        const found = rows.find((r) => r.id === id) ?? null;
        setRow(found);
        if (found && !found.openedAt) {
          void markLetterOpened({ data: { id: found.id } });
        }
      })
      .catch(() => {
        if (!cancelled) setRow(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isPending, user]);

  if (isPending || row === undefined) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl px-5 py-24">
          <div className="h-[32rem] animate-pulse rounded-xl bg-paper/20" />
        </div>
      </PageShell>
    );
  }

  if (!user) return <RedirectToSignIn />;
  if (!row) throw notFound();

  const letter = getLetter(row.letterKey);
  if (!letter) throw notFound();

  const date = new Date(row.createdAt);
  const dateLabel = Number.isNaN(date.getTime())
    ? undefined
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          to="/correspondence"
          className="inline-flex min-h-11 items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted hover:text-fg"
        >
          <ArrowLeft className="size-3.5" />
          The tray
        </Link>
        <div className="mt-8 animate-[letter-open_600ms_var(--ease-smooth-out)]">
          <Letter
            letter={letter}
            recipient={user.displayName ?? undefined}
            dateLabel={dateLabel}
          />
        </div>
      </div>
    </PageShell>
  );
}
