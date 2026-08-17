export type LetterTemplate = {
  key: string;
  subject: string;
  fromName: string;
  fromTitle: string;
  kicker: string;
  greeting: string;
  paragraphs: string[];
  close: string;
  signOff: string;
};

export const letterTemplates: LetterTemplate[] = [
  {
    key: "welcome",
    subject: "Election to the Atelier",
    fromName: "Helena Voss",
    fromTitle: "Managing Partner, Atrium",
    kicker: "Private & confidential",
    greeting: "Dear colleague,",
    paragraphs: [
      "I am writing to confirm your election to Atrium. We do not send this letter lightly. The atelier is small by design. We prefer a short table and a long memory.",
      "You will find, in the pages that follow your admission, a complete map of the private-equity partnership track: the work at each rank, the economics as they actually are in the major markets, the six dimensions that separate those who remain from those who are politely moved along, and a mastery plan that can be practiced rather than admired.",
      "A word on tone. We will not flatter you. Technical excellence is the price of the first seat, not the argument for the last one. Carry is not a rumor and not a lottery ticket — it is a delayed claim on realized outcomes, subject to vesting, hurdles, and time. If that sentence feels unromantic, you are in the correct room.",
      "Your first correspondence after this letter is an assignment, not a welcome basket. Complete it in your own hand. We are interested in how you think when nobody is watching the model.",
    ],
    close: "Welcome. Hold the standard.",
    signOff: "Yours,",
  },
  {
    key: "assignment",
    subject: "First assignment — a paper LBO, daily",
    fromName: "James Calder",
    fromTitle: "Head of the Associate Practice",
    kicker: "Curriculum · Week one",
    greeting: "Colleague,",
    paragraphs: [
      "Beginning tomorrow, you will complete one paper LBO each morning before you open anyone else’s file. Sources and uses. A debt schedule with a cash sweep. An operating forecast you can defend. Exit returns. Attribution that separates earnings growth from multiple expansion from paydown.",
      "Time yourself. If it takes more than twenty-five minutes, you are still translating rather than thinking. If it takes six and the numbers are decorative, you are performing. Neither is useful.",
      "Keep the pages. In ninety days we will ask you to put three of them next to a live memorandum you have worked. The comparison is the tuition.",
      "When the mechanics are quiet, begin the second practice: a one-page independent thesis on every CIM that crosses your desk. What would make this a good deal. What would make it a bad one. Date it. You will need the record later, when memory becomes generous.",
    ],
    close: "Send nothing back. Do the work.",
    signOff: "Respectfully,",
  },
  {
    key: "carry",
    subject: "On carry — and why it is not yet yours",
    fromName: "Helena Voss",
    fromTitle: "Managing Partner, Atrium",
    kicker: "A note on economics",
    greeting: "Dear colleague,",
    paragraphs: [
      "You will hear points discussed as if they were cash. They are not. Carry is allocated by the partnership. It vests over years — commonly four to six, often longer. It realizes only after capital is returned, the hurdle is cleared, and an exit has actually occurred. An early grant can look handsome on a slide and remain modest in your account until a fund matures.",
      "This is not a reason for cynicism. It is a reason for precision. Model the timing. Understand the difference between a mark and a realization. Do not let a generous paper number become the story you tell about your own career.",
      "At the associate seat, carry is rare or token — zero to half a point, sometimes a co-invest right. It becomes meaningful at Vice President, material at Principal, and the center of the economics at Partner. Plan your life on cash you can see. Let carry be the convexity, not the rent.",
      "If you stay, you will also need to understand how LPs judge the firm that pays you. Consistency, team stability, alignment, the quality of the track record. Fundraising is not a later chapter. It is the weather system the whole ladder sits inside.",
    ],
    close: "Read the economics the way you would read a credit agreement — calmly, and to the last clause.",
    signOff: "Yours,",
  },
];

export function getLetter(key: string): LetterTemplate | undefined {
  return letterTemplates.find((l) => l.key === key);
}
