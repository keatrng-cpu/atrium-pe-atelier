import { ranks, type RankId } from "@/data/ranks";

export type MemberProfile = {
  givenName: string;
  jobLevel: string;
  birthday: string;
  company: string;
  goals: string;
  struggles: string;
  strengths: string;
  education: string;
  experience: string;
};

export const emptyProfile = (): MemberProfile => ({
  givenName: "",
  jobLevel: "",
  birthday: "",
  company: "",
  goals: "",
  struggles: "",
  strengths: "",
  education: "",
  experience: "",
});

export const jobLevelOptions: { id: string; label: string }[] = [
  { id: "", label: "Prefer not to say" },
  { id: "incoming", label: "Recruiting / incoming" },
  ...ranks.map((r) => ({ id: r.id, label: r.title })),
  { id: "other", label: "Adjacent / other" },
];

export function jobLevelLabel(id: string) {
  return jobLevelOptions.find((o) => o.id === id)?.label ?? "";
}

export function rankFromProfile(jobLevel: string): RankId {
  return ranks.some((r) => r.id === jobLevel) ? (jobLevel as RankId) : "analyst";
}

export function formatDossier(profile: MemberProfile) {
  const lines: string[] = [];
  if (profile.givenName) lines.push(`Name: ${profile.givenName}`);
  if (profile.jobLevel) lines.push(`Seat / job level: ${jobLevelLabel(profile.jobLevel)}`);
  if (profile.birthday) lines.push(`Birthday: ${profile.birthday}`);
  if (profile.company) lines.push(`Firm / company: ${profile.company}`);
  if (profile.goals) lines.push(`Goals: ${profile.goals}`);
  if (profile.struggles) lines.push(`Struggles: ${profile.struggles}`);
  if (profile.strengths) lines.push(`Strong suit: ${profile.strengths}`);
  if (profile.education) lines.push(`Education: ${profile.education}`);
  if (profile.experience) lines.push(`Experience: ${profile.experience}`);
  return lines.join("\n");
}
