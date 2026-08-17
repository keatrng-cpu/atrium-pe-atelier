import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}

export function PageIntro({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-4 pt-14 sm:px-8 sm:pt-20">
      <p className="text-[11px] uppercase tracking-[0.22em] text-accent">{kicker}</p>
      <div className="gold-rule mt-4 w-16" />
      <h1 className="mt-6 font-display text-4xl font-medium text-fg sm:text-6xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{lede}</p>
    </div>
  );
}
