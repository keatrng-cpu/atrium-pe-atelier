import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-[11px] font-medium uppercase tracking-[0.18em] text-muted",
        className,
      )}
      {...props}
    />
  );
}
