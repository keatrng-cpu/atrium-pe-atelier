export type Dimension = {
  id: string;
  numeral: string;
  title: string;
  when: string;
  body: string;
  signals: string[];
};

export const dimensions: Dimension[] = [
  {
    id: "technical",
    numeral: "01",
    title: "Technical excellence, early",
    when: "Associate years — table stakes thereafter",
    body: "Flawless, fast LBO models under time pressure. Diligence that surfaces real risk rather than confirming the thesis. Clean attribution of returns drivers: EBITDA growth versus multiple expansion versus debt paydown. Technical excellence gets you in the door and through the associate years. After that, it is assumed.",
    signals: [
      "Blank-sheet LBO under a clock, without theater",
      "Sources & uses that reconcil to the last dollar",
      "Credit agreements and intercreditor dynamics, not just the term sheet",
      "Paper LBOs practiced until they are muscle memory",
    ],
  },
  {
    id: "origination",
    numeral: "02",
    title: "Deal origination and network",
    when: "Primary metric by VP / Principal",
    body: "Proprietary sourcing — founders, operators, intermediaries, corporate development — becomes a scored line. High performers keep a personal pipeline. They do not wait for the banker auction and then compete on price.",
    signals: [
      "A living personal pipeline, reviewed weekly",
      "Relationships that predate the process",
      "The discipline to stay useful when there is no live deal",
      "Banker coverage that is earned, not requested",
    ],
  },
  {
    id: "judgment",
    numeral: "03",
    title: "Investment judgment",
    when: "Evaluated through live track record and IC",
    body: "Pattern recognition across cycles. The ability to underwrite risk accurately. The willingness to walk away from a popular but flawed deal, and the conviction to hold a view under uncertainty. This is not a personality trait. It is a recorded history of decisions.",
    signals: [
      "Written theses that predate the CIM consensus",
      "A personal deal log with lessons, including the ones that hurt",
      "Walking away documented as carefully as closing",
      "IC comments that change the room, not decorate it",
    ],
  },
  {
    id: "portfolio",
    numeral: "04",
    title: "Portfolio impact",
    when: "Increasingly tracked in explicit numbers",
    body: "Measurable operational value creation: revenue growth, margin expansion, successful bolt-ons, management upgrades. Firms no longer accept financial engineering as the whole story. You will be asked what you did to the company, not only what you paid for it.",
    signals: [
      "KPI packs that a board can act on",
      "Named initiatives with owners, dates, and dollars",
      "Bolt-on theses that survive contact with operations",
      "Management changes handled with adult judgment",
    ],
  },
  {
    id: "leadership",
    numeral: "05",
    title: "Leadership and soft skill",
    when: "The airport test is real",
    body: "Manage and influence CEOs — often founder-led. Negotiate the ugly moments. Mentor juniors. Navigate firm politics without becoming them. Cultural fit in a small, high-stakes team is not a soft extra. It is how partnerships decide who they will sit next to for a decade.",
    signals: [
      "A CEO who will take your call when the news is bad",
      "Juniors who get better, not just busier",
      "Negotiations that leave the relationship intact",
      "Sponsorship earned by being safe in a room",
    ],
  },
  {
    id: "domain",
    numeral: "06",
    title: "Domain expertise",
    when: "Accelerant at middle-market and specialist firms",
    body: "Deep sector knowledge — and the relationships that come with it — is a major differentiator. Generalists can still succeed at the largest firms. Specialization accelerates promotion in many other rooms. The associated network is not a side effect. It is the asset.",
    signals: [
      "A sector map you can draw from memory",
      "Operators who call you before the banker does",
      "A point of view on regulation, customers, and multiples",
      "The humility to know the one industry you do not fake",
    ],
  },
];

export const partnerSelectors = [
  "Internal sponsorship — a senior partner who will say your name in the room that decides",
  "Consistency of realized exits, not paper marks",
  "A visible contribution to fundraising",
  "Cultural alignment with the partnership as it actually is",
];
