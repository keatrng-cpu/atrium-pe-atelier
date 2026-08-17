import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { realities } from "@/data/realities";

export const Route = createFileRoute("/realities")({ component: RealitiesPage });

function RealitiesPage() {
  return (
    <PageShell>
      <PageIntro
        kicker="Gaps and additional realities"
        title="The parts the brochure leaves thin."
        lede="Carry is not cash. Hours are not banking, and they are not light. Exit ramps are often the intelligent move. Sponsorship is not optional after VP. Cycles move the pyramid under your feet."
      />
      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-24 sm:px-8 md:grid-cols-2">
        {realities.map((item, i) => (
          <Reveal key={item.id} delay={i * 50}>
            <article className="flex h-full flex-col rounded-2xl bg-surface p-7 shadow-[var(--shadow-border)]">
              <h2 className="font-display text-3xl text-fg">{item.title}</h2>
              <p className="mt-4 text-muted">{item.body}</p>
            </article>
          </Reveal>
        ))}
      </section>
    </PageShell>
  );
}
