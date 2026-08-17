export const houseSeats = [
  { id: "analyst", label: "Analyst / Associate", short: "Associate" },
  { id: "senior-associate", label: "Senior Associate", short: "Sr Assoc" },
  { id: "vice-president", label: "Vice President", short: "VP" },
  { id: "principal", label: "Principal", short: "Principal" },
  { id: "partner", label: "Partner", short: "Partner" },
  { id: "operating-partner", label: "Operating Partner", short: "Op Partner" },
] as const;

export const houseFunctions = [
  { id: "origination", label: "Origination", brief: "Sourcing, coverage, first meetings." },
  { id: "execution", label: "Execution", brief: "Process, models, papers, close." },
  { id: "diligence", label: "Diligence", brief: "Workstreams that can kill the deal." },
  { id: "portfolio", label: "Portfolio", brief: "Boards, KPI packs, variance." },
  { id: "value-creation", label: "Value creation", brief: "Named initiatives with owners and dollars." },
  { id: "capital-markets", label: "Capital markets", brief: "Financing, refinancing, exits." },
  { id: "lp-relations", label: "LP / IR", brief: "Letters, fundraising, allocator time." },
  { id: "finance", label: "Finance & ops", brief: "Fund admin, carry, the machine." },
] as const;

export const dealStages = [
  { id: "sourcing", label: "Sourcing" },
  { id: "cim", label: "CIM / teaser" },
  { id: "ioi", label: "IOI" },
  { id: "diligence", label: "Diligence" },
  { id: "ic", label: "IC" },
  { id: "loi", label: "LOI" },
  { id: "signed", label: "Signed" },
  { id: "closed", label: "Closed" },
  { id: "passed", label: "Passed" },
] as const;

export const meetingKinds = [
  { id: "ic", label: "Investment committee" },
  { id: "pipeline", label: "Pipeline" },
  { id: "portfolio", label: "Portfolio review" },
  { id: "diligence", label: "Diligence stand-up" },
  { id: "recruiting", label: "Talent" },
  { id: "adhoc", label: "Working session" },
] as const;

export const alertKinds = [
  { id: "meeting", label: "Meeting" },
  { id: "deadline", label: "Deadline" },
  { id: "ic-prep", label: "IC prep" },
  { id: "kpi", label: "KPI" },
  { id: "covenant", label: "Covenant" },
  { id: "sourcing", label: "Sourcing" },
  { id: "custom", label: "Watch" },
] as const;

export const healthStates = [
  { id: "on-plan", label: "On plan" },
  { id: "watch", label: "Watch" },
  { id: "off-plan", label: "Off plan" },
] as const;

export type HouseSeatId = (typeof houseSeats)[number]["id"];
export type HouseFunctionId = (typeof houseFunctions)[number]["id"];
export type DealStageId = (typeof dealStages)[number]["id"];
export type MeetingKindId = (typeof meetingKinds)[number]["id"];

export function labelOf<T extends { id: string; label: string }>(list: readonly T[], id: string) {
  return list.find((x) => x.id === id)?.label ?? id;
}
