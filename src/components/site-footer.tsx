import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl text-fg">Atrium</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            A private curriculum for the partnership track — ranks, economics, judgment, and the
            work that actually compounds.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-subtle">
          <Link to="/house" className="hover:text-fg">
            House
          </Link>
          <Link to="/research" className="hover:text-fg">
            Research
          </Link>
          <Link to="/desk" className="hover:text-fg">
            Desk
          </Link>
          <Link to="/ladder" className="hover:text-fg">
            Ladder
          </Link>
          <Link to="/login" className="hover:text-fg">
            Members
          </Link>
          <span>New York · London</span>
        </div>
      </div>
    </footer>
  );
}
