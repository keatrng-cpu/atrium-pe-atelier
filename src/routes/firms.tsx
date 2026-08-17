import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { firmContrast } from "@/data/realities";

export const Route = createFileRoute("/firms")({ component: FirmsPage });

function FirmsPage() {
  const blocks = [firmContrast.mega, firmContrast.middle];
  return (
    <PageShell>
      <PageIntro
        kicker="Firm-type differences"
        title="The same title is not the same job."
        lede="Megafunds pay more, specialize earlier, and promote through a steeper pyramid. Middle-market seats give you the work sooner — and make your contribution harder to hide."
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-2">
        {blocks.map((block, i) => (
          <Reveal key={block.title} delay={i * 80}>
            <article className="flex h-full flex-col rounded-2xl bg-surface p-8 shadow-[var(--shadow-border)]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-accent">{block.names}</p>
              <h2 className="mt-3 font-display text-4xl text-fg">{block.title}</h2>
              <ul className="mt-8 space-y-4">
                {block.points.map((p) => (
                  <li key={p} className="border-t border-border pt-4 text-muted">
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </section>
      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <Reveal>
          <blockquote className="font-display text-3xl italic text-fg sm:text-4xl">
            Lifestyle and culture vary more by firm than by size. Diligence the partnership the way
            you would diligence a founder.
          </blockquote>
        </Reveal>
      </section>
    </PageShell>
  );
}
