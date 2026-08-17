import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-36 w-full rounded-lg border border-border bg-elevated px-3.5 py-3 font-sans text-sm text-fg placeholder:text-subtle outline-none transition-[box-shadow,border-color] duration-150 ease-out focus-visible:border-accent/50 focus-visible:ring-2 focus-visible:ring-accent/30",
        className,
      )}
      {...props}
    />
  );
}
