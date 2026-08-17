export type MasterySkill = {
  id: string;
  numeral: string;
  title: string;
  aim: string;
  drills: string[];
  proof: string;
};

export const masterySkills: MasterySkill[] = [
  {
    id: "fundamentals",
    numeral: "01",
    title: "Master the fundamentals",
    aim: "Reach the point where a full LBO — sources & uses, debt schedule with cash sweep, operating forecast, exit returns, returns attribution — comes off a blank sheet under time pressure.",
    drills: [
      "Build one paper LBO every morning in the associate years. Time it.",
      "Rebuild a live deal model from scratch on Sunday. Compare to the working file.",
      "Read one credit agreement a month until the covenants speak in your own language.",
      "Practice intercreditor dynamics: first lien, second lien, holdco PIK, and what actually happens in distress.",
    ],
    proof: "A partner can hand you a CIM at 6pm and trust the Monday morning model.",
  },
  {
    id: "commercial",
    numeral: "02",
    title: "Develop commercial instincts",
    aim: "Stop being a processor of other people’s theses. Build your own, and keep them honest against the world.",
    drills: [
      "Critically read every CIM. Write, in a page, what would make this a good deal and a bad one.",
      "Track two industries continuously: competitors, regulation, customer behavior, valuation multiples.",
      "Keep a personal deal log. Date, thesis, decision, outcome, the lesson you would rather forget.",
      "Revisit your own memos a year later. Mark where you were lucky versus right.",
    ],
    proof: "You can defend a pass as cleanly as a close.",
  },
  {
    id: "responsibility",
    numeral: "03",
    title: "Seek progressive responsibility",
    aim: "Push for ownership of full workstreams, then full deals, then sourcing, then a board observer seat. Do not wait to be invited twice.",
    drills: [
      "Volunteer for the diligence module nobody wants. Finish it early and quietly.",
      "Ask to own a portfolio company workstream with a number attached.",
      "Document contributions in quantities a partner can repeat: dollars, basis points, days saved.",
      "When you manage juniors, treat their output as your signature.",
    ],
    proof: "Your name is already on the work before the title catches up.",
  },
  {
    id: "operating",
    numeral: "04",
    title: "Build operating knowledge",
    aim: "Understand how value is created on the ground — pricing power, sales-force effectiveness, procurement, digital transformation, talent. Pure financial skill is no longer sufficient.",
    drills: [
      "Spend real time with portfolio management, operating partners, and consultants — not only the board pack.",
      "Sit in a weekly commercial meeting and listen for the numbers that never make the IC memo.",
      "Learn one operating lever deeply enough to argue it with a CEO.",
      "Study why the firm hired operating partners. That hire is a map of what finance alone cannot do.",
    ],
    proof: "A CEO treats you as useful, not decorative.",
  },
  {
    id: "lp",
    numeral: "05",
    title: "Cultivate LP relationships and fundraising",
    aim: "At senior levels this becomes essential. Learn how LPs evaluate managers: track-record quality, consistency, team stability, alignment.",
    drills: [
      "Practice articulating the firm’s edge in ninety seconds, without adjectives.",
      "Read an LP due-diligence questionnaire as if you were the allocator.",
      "Sit in on an LP update if invited. Note what they actually ask.",
      "Study failed fundraises with the same care as successful ones.",
    ],
    proof: "You can explain the firm to a sophisticated allocator without a deck.",
  },
  {
    id: "feedback",
    numeral: "06",
    title: "Continuous learning and feedback loops",
    aim: "The market changes. Your pattern recognition must be fed, or it decays into folklore.",
    drills: [
      "Read the Bain Global PE Report, the McKinsey Global Private Markets Report, PitchBook and Preqin — annually, with notes.",
      "Study both successful and failed deals in depth. Failure is the cheaper tuition.",
      "Seek blunt feedback after every process. Write it down. Act on one item.",
      "Network with operators, other investors, and intermediaries for pattern recognition — not only for deal flow.",
    ],
    proof: "Your views from three years ago would not survive a conversation with you today.",
  },
  {
    id: "track",
    numeral: "07",
    title: "Track record above all",
    aim: "Successful exits and consistent returns are the ultimate currency. Protect a personal reputation for judgment and integrity as if it were carry — because it is.",
    drills: [
      "Keep a private scorecard of every recommendation you made and what happened.",
      "Never let a mark substitute for a realization in how you talk about your own work.",
      "Decline the clever thing that would be hard to defend in five years.",
      "Treat your name in the market as a permanent security. It compounds in both directions.",
    ],
    proof: "People will take your word in a room you have not yet entered.",
  },
];
