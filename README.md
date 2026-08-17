# Atrium

A private curriculum — and a working desk — for the private-equity partnership track.

The site maps the typical ladder, compensation, the six dimensions that separate high performers, and a seven-practice mastery plan. The **desk** does the jobs of each seat: paper LBOs, returns attribution, carry waterfalls, IC memos, diligence, KPI packs, sourcing, value-creation plans, and LP letters.

Numbers are computed in deterministic engines. Counsel (Grok) only explains figures it is given — the same rule as ProFX and Ledger Desk.

## Desk

- Paper LBO: sources & uses, cash sweep, MOIC, IRR, attribution
- Carry waterfall: preferred, catch-up, promote
- Rank-aware jobs from Associate through Partner
- Counsel drafts memos and theses without inventing numbers
- Library files work to the signed-in member

## Scope

Atrium is a place to practise the track and run a working house. It is not a
system of record, and [SCOPE.md](SCOPE.md) says so precisely: no data room or
CIM ingest, no Excel or PowerPoint out, no IC vote that is a legal record, no
fund admin or carry ledger a CFO would sign, no calendar or email or video, no
roles beyond "you sit here", and no PitchBook or CapIQ — research is the open
web plus the public tape.

Those boundaries are enforced, not just documented. Because a seat grants
everything inside a house, the house is the only boundary there is, so every
server function that takes a caller-supplied id checks the row belongs to the
caller's house — and `scripts/house-scope.test.mjs` fails the build if a new one
forgets. A new house opens with a demo book so the room is not empty; every
seeded row is labelled `Demo` and clears in one action.

Read SCOPE.md before adding a feature. If a boundary ever becomes wrong, change
that file in the same commit.

## Stack

React 19, TanStack Start, Tailwind v4, Better Auth, Postgres / PGLite, xAI Grok.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
```
