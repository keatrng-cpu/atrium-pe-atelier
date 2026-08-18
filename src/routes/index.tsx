import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { ranks } from "@/data/ranks";
import { dimensions } from "@/data/performers";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <PageShell>
      <section className="relative isolate overflow-hidden grain">
        <img
          src="/images/hero-boardroom.jpg"
          alt="A private boardroom at dusk"
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/55 to-bg" />
        <div className="relative mx-auto flex min-h-[88dvh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-24">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">
            Est. MMXXVI · New York · London
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-medium text-fg sm:text-7xl lg:text-8xl">
            The private practice of becoming a partner.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            A complete map of the ladder — and a desk that does the work of each seat. Engines
            compute the numbers. Counsel writes the prose. Neither invents the other.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/desk">
                Open the desk
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/street">The street</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent">The ranks</p>
          <h2 className="mt-3 font-display text-4xl text-fg sm:text-5xl">Five seats. One track.</h2>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {ranks.map((rank, i) => (
            <Reveal key={rank.id} delay={i * 70}>
              <Link
                to="/ladder/$rank"
                params={{ rank: rank.id }}
                className="group flex h-full flex-col rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-200 ease-out hover:shadow-[var(--shadow-border-hover)]"
              >
                <span className="font-display text-3xl text-accent">{rank.roman}</span>
                <h3 className="mt-4 font-display text-2xl text-fg">{rank.shortTitle}</h3>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-subtle">{rank.years}</p>
                <p className="mt-4 text-sm text-muted">{rank.cash.mega}</p>
                <span className="mt-auto pt-6 text-[11px] uppercase tracking-[0.16em] text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  Read the seat
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <img
              src="/images/library.jpg"
              alt="A private members library"
              className="aspect-[3/4] w-full rounded-xl object-cover sm:aspect-[4/5]"
            />
          </Reveal>
          <Reveal delay={80}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-accent">The desk</p>
            <h2 className="mt-3 font-display text-4xl text-fg sm:text-5xl">
              Paper LBOs, IC memos, and a partner in the room.
            </h2>
            <p className="mt-5 text-muted">
              From Helix, Ledger Desk, and ProFX we took the rule that matters: compute in code,
              let intelligence explain. Attribution, carry, and returns never come from the model’s
              imagination.
            </p>
            <ol className="mt-8 space-y-4">
              {dimensions.map((d) => (
                <li key={d.id} className="flex gap-4 border-t border-border pt-4">
                  <span className="font-display text-xl text-accent">{d.numeral}</span>
                  <div>
                    <p className="font-medium text-fg">{d.title}</p>
                    <p className="text-sm text-subtle">{d.when}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button variant="outline" asChild>
                <Link to="/performers">
                  The six dimensions
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Membership</p>
            <h2 className="mt-3 font-display text-4xl text-fg sm:text-5xl">
              Correspondence, then practice.
            </h2>
            <p className="mt-5 max-w-xl text-muted">
              Join and you receive three letters on cream stock. The desk keeps your LBOs, memos,
              and counsel. The studio keeps the seven practices honest.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/signup">Open an account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/desk">Enter the desk</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <img
              src="/images/letter.jpg"
              alt="Cream stationery and a wax-sealed envelope"
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
