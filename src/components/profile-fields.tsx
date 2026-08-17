import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { jobLevelOptions, type MemberProfile } from "@/data/profile";
import { cn } from "@/lib/utils";

export function ProfileFields({
  value,
  onChange,
  nameRequired,
}: {
  value: MemberProfile;
  onChange: (next: MemberProfile) => void;
  nameRequired?: boolean;
}) {
  function set<K extends keyof MemberProfile>(key: K, next: MemberProfile[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="given-name">
          Name {nameRequired ? "" : <span className="normal-case tracking-normal text-subtle">· required</span>}
        </Label>
        <Input
          id="given-name"
          autoComplete="name"
          required={nameRequired}
          value={value.givenName}
          onChange={(e) => set("givenName", e.target.value)}
          placeholder="As you wish to be addressed"
        />
      </div>

      <div>
        <Label>Job level</Label>
        <p className="mt-1 text-xs text-subtle">Optional. Counsel will speak to this seat.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {jobLevelOptions.map((opt) => (
            <button
              key={opt.id || "none"}
              type="button"
              onClick={() => set("jobLevel", opt.id)}
              className={cn(
                "h-10 rounded-full px-3 text-[11px] uppercase tracking-[0.12em] transition-colors duration-150",
                value.jobLevel === opt.id
                  ? "bg-accent text-accent-fg"
                  : "bg-elevated text-muted hover:text-fg",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="birthday">Birthday</Label>
          <Input
            id="birthday"
            type="date"
            value={value.birthday}
            onChange={(e) => set("birthday", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            autoComplete="organization"
            value={value.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Firm, bank, or current house"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals">Goals</Label>
        <Textarea
          id="goals"
          className="min-h-24"
          value={value.goals}
          onChange={(e) => set("goals", e.target.value)}
          placeholder="The seat, the firm, the life you are building toward."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="struggles">What you struggle with</Label>
        <Textarea
          id="struggles"
          className="min-h-24"
          value={value.struggles}
          onChange={(e) => set("struggles", e.target.value)}
          placeholder="Judgment under uncertainty, origination, presence in the room…"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="strengths">Strong suit</Label>
        <Textarea
          id="strengths"
          className="min-h-24"
          value={value.strengths}
          onChange={(e) => set("strengths", e.target.value)}
          placeholder="Where you are already dangerous."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="education">Education</Label>
        <Textarea
          id="education"
          className="min-h-24"
          value={value.education}
          onChange={(e) => set("education", e.target.value)}
          placeholder="School, degree, anything Counsel should not re-ask."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="experience">Experience</Label>
        <Textarea
          id="experience"
          className="min-h-24"
          value={value.experience}
          onChange={(e) => set("experience", e.target.value)}
          placeholder="IB, consulting, operating roles, funds. Years and nature, not a résumé dump."
        />
      </div>
    </div>
  );
}
