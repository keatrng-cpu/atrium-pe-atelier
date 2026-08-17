# Scope

What Atrium is, stated as what it refuses to be.

Atrium is a place to *practise* the partnership track and to *run* a working
house with other people. It is not a system of record. Every boundary below
exists so that nobody — member, counterparty, or auditor — can mistake it for
one. Each is enforced in code or stated in the interface at the point where the
mistake would otherwise be made; the enforcement sites are named so the boundary
survives the next feature.

---

## 1. No virtual data room, no CIM ingest

There is no document store, no upload, no file parsing anywhere in the app. A
deal on the book carries a name, a sector, a stage, an enterprise value written
as free text, a next action, and a working thesis — all typed by a member.

**Why.** A VDR is a custody and confidentiality product. The moment Atrium holds
a CIM it inherits an NDA perimeter, retention duties, and a breach surface, and
none of that makes anyone better at the job. The thinking is the product; the
documents stay where they already live.

**Instead.** You bring what you read and write the thesis yourself. That is the
exercise.

**Enforced by.** No upload route, no object storage, no file field in any
migration. `migrations/0005_house.sql` is the whole house schema — it is all
short text columns.

## 2. No Excel or PowerPoint out

Work leaves Atrium as text on screen. There is no `.xlsx`, no `.pptx`, no
export pipeline, and no print-to-deck.

**Why.** An exported model becomes the artefact people circulate and trust, and
a spreadsheet detached from its engine is a number without a provenance. The
engines are the authority precisely because you cannot carry their output away
from them.

**Instead.** Filed work products keep the inputs *and* the outputs as JSON
(`work_products.input_json` / `output_json`), so any figure on the desk can be
rebuilt from the inputs that produced it.

**Enforced by.** No spreadsheet or presentation dependency in `package.json`.

## 3. No IC vote that is a legal record

The IC room captures an agenda, minutes, attendance, floor notes, and a written
decision. It does not hold a vote. There is no ballot, no tally, no quorum rule,
no signature, and no lock.

**Why.** A vote that looks binding but is not is worse than no vote at all.
Corporate action needs authority, identity assurance, and an immutable record —
Atrium has a self-service invite code and a free-text seat, so it has none of
the three.

**Instead.** The decision field records what the room concluded, in one
sentence, as a working note.

**Enforced by.** `house_meetings.decision` is plain text with no state machine,
and the room states the boundary under the field
(`src/routes/house.rooms.$id.tsx`).

## 4. No fund admin, capital calls, or carry ledger a CFO would sign

The carry waterfall is a calculator. It takes invested capital, proceeds, hold
period, hurdle, carry percentage, and a catch-up flag, and returns the split. It
does not know your fund. There are no capital accounts, no LP register, no
drawdown or distribution notices, no vesting schedule, and no allocation table.

**Why.** Fund accounting is audited work with a signer on the end of it. A
teaching calculator that keeps balances would eventually be reconciled against
by someone, and it would be wrong.

**Instead.** Practice the mechanics — preferred return, catch-up
(`pref × c/(1−c)`), promote — until the timing is intuitive. `runCarry` asserts
that LP and GP proceeds foot to the total.

**Enforced by.** `src/lib/engines/carry.ts` is pure and stateless — it persists
nothing. The panel states the boundary
(`src/components/desk/carry-panel.tsx`).

## 5. No calendar, no Zoom, no email

Atrium sends nothing and connects to nothing. Rooms have a `startsAt` string and
a location that is a word like "Boardroom A". Alerts appear on the floor and
nowhere else. No invitations, no reminders, no notifications, no video, no
mailbox.

**Why.** The moment an app can reach people it acquires deliverability,
consent, and calendar-integrity problems that have nothing to do with private
equity. Atrium is a place you go, not a thing that arrives.

**Instead.** The floor is the notification surface. Open alerts show a count in
the house nav; a room is a page you walk into.

**Enforced by.** No mail, calendar, or realtime dependency in `package.json`;
no outbound network call anywhere except the two named in §7.

## 6. No roles or permissions beyond "you sit here"

Everyone seated in a house may work the whole book: add a process, move a stage,
open a room, write minutes, post a watch, edit a holding, reseat a colleague.
There is no admin, no owner, no approval, and no read-only seat. Seat and
function are labels describing what you are practising — never a capability.

**Why.** Permission systems are how software imports a firm's politics. A house
of five people who chose to sit together does not need an access-control matrix;
it needs a shared book.

**But** — and this is the load-bearing consequence — if the seat grants
everything inside the house, then *the house is the only boundary there is*, and
it has to hold absolutely. Every house record is addressed by an id the client
supplies. Being seated in some house must never be enough to touch a record in
another one.

**Enforced by.** `assertDealInHouse`, `assertMeetingInHouse`, and
`assertCompanyInHouse` in `src/lib/server/house.ts`. Every server function that
accepts a caller-supplied id calls the matching guard before it reads or writes.
`requireHouse` alone is never sufficient: it proves the caller sits somewhere,
not that the row they named sits with them. `scripts/house-scope.test.mjs`
fails the build if a new server function skips its guard.

## 7. No PitchBook or CapIQ feed — research is the open web and the tape

The research desk has exactly two sources: web search, and daily public price
data for a ticker you supply. There is no subscription data feed, no private
comp set, no deal database, no fund-returns database.

**Why.** Those feeds are licensed per seat and their terms do not survive being
redistributed through an app. More to the point, a brief is worth reading
because its claims are traceable — and a claim from a feed nobody else can open
is not.

**Consequence, stated plainly.** Private-company marks, transaction comps, and
fund returns are only as good as what has been published. Briefs on private
subjects will be thinner than briefs on listed ones. That is the honest state of
the evidence, not a defect to be papered over with a plausible number.

**Instead.** The drafter must support every material fact from a source it
opened, and cited URLs are extracted and stored with the brief. A second pass
grades the brief against its own citation list and flags unsupported claims —
and when that review cannot complete, the grade fails closed to `revise`.

**Enforced by.** `RESEARCH_SYSTEM` and `REVIEW_SYSTEM` in
`src/data/research.ts`; `fetchTickerAnalytics` in `src/lib/engines/market.ts` is
the only market call. Where the tape cannot be fetched, the prompt says so
explicitly rather than letting the model fill the gap.

---

## What a house *does* get on day one

A new house opens with a demo book — three processes at different stages, their
diligence workstreams, a pipeline meeting and an IC, three watches, and two
holdings — so the room is not empty and every screen has something to show.

Two rules keep the seed honest:

1. **It is always labelled.** Every seeded row carries `seeded = true`
   (`migrations/0007_scope.sql`) and renders a `Demo` tag everywhere it is
   listed — floor, pipeline, rooms, alerts, portfolio.
2. **It is always removable.** `clearDemoBook` deletes every seeded row and
   nothing else, in one action from the floor.

A book you cannot tell apart from your own work is worse than an empty one.

---

## Extending this

These are product boundaries, not a backlog. Adding a VDR, an export, a binding
vote, a carry ledger, a mail integration, a role model, or a licensed data feed
does not extend Atrium — it makes it a different product with a different
compliance surface. If one of them ever becomes right, the honest move is to
change this file first, in the same commit.
