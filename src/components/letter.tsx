import type { LetterTemplate } from "@/data/letters";
import { cn } from "@/lib/utils";

export function Letter({
  letter,
  recipient,
  dateLabel,
  className,
}: {
  letter: LetterTemplate;
  recipient?: string;
  dateLabel?: string;
  className?: string;
}) {
  const greeting = recipient
    ? `Dear ${recipient.split(" ")[0]},`
    : letter.greeting;

  return (
    <article
      className={cn(
        "paper-letter relative overflow-hidden rounded-xl px-7 py-8 sm:px-11 sm:py-11",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-paper-rule/70" />
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-2xl tracking-tight text-paper-ink">Atrium</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-paper-muted">
            Private Equity Career Atelier
          </p>
        </div>
        <p className="text-right text-[10px] uppercase tracking-[0.18em] text-paper-muted">
          {letter.kicker}
          {dateLabel ? (
            <>
              <br />
              {dateLabel}
            </>
          ) : null}
        </p>
      </header>
      <div className="mt-6 h-px w-16 bg-paper-rule" />
      <h2 className="mt-6 font-display text-3xl font-medium tracking-tight text-paper-ink sm:text-4xl">
        {letter.subject}
      </h2>
      <p className="mt-6 font-serif text-lg italic text-paper-ink">{greeting}</p>
      <div className="mt-4 space-y-4 font-serif text-[17px] leading-relaxed text-paper-ink/90">
        {letter.paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
      <p className="mt-6 font-serif text-[17px] italic text-paper-ink">{letter.close}</p>
      <footer className="mt-8">
        <p className="font-serif text-base text-paper-muted">{letter.signOff}</p>
        <p className="mt-2 font-display text-2xl italic text-paper-ink">{letter.fromName}</p>
        <p className="text-[11px] uppercase tracking-[0.16em] text-paper-muted">
          {letter.fromTitle}
        </p>
      </footer>
    </article>
  );
}
