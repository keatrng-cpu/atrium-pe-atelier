import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { masterySkills } from "@/data/mastery";

export const Route = createFileRoute("/mastery")({ component: MasteryPage });

function MasteryPage() {
  return (
    <PageShell>
      <PageIntro
        kicker="Mastery development plan"
        title="Seven practices, written to be done."
        lede="Not a reading list. A sequence of drills that compound: fundamentals first, then commercial instinct, then ownership, operations, LPs, feedback, and the track record that is the only currency that survives a cycle."
      />

      <section className="mx-auto max-w-4xl space-y-16 px-5 pb-10 sm:px-8">
        {masterySkills.map((skill, i) => (
          <Reveal key={skill.id} delay={i * 30}>
            <article>
              <p className="text-[11px] uppercase tracking-[0.22em] text-accent">
                Practice {skill.numeral}
              </p>
              <h2 className="mt-3 font-display text-4xl text-fg">{skill.title}</h2>
              <p className="mt-4 text-muted">{skill.aim}</p>
              <ol className="mt-6 space-y-3">
                {skill.drills.map((drill, idx) => (
                  <li key={drill} className="flex gap-4 border-t border-border pt-3 text-sm text-fg">
                    <span className="font-display text-lg text-accent">{idx + 1}</span>
                    <span>{drill}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 font-display text-xl italic text-fg">Proof: {skill.proof}</p>
            </article>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="rounded-2xl bg-surface p-8 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-3xl text-fg">Keep the plan in the studio</h2>
            <p className="mt-3 text-muted">
              Members mark each practice as unstarted, in motion, or mastered — and keep a private
              deal log next to it.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/studio">Open the studio</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
