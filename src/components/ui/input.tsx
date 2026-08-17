import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-border bg-elevated px-3.5 font-sans text-sm text-fg placeholder:text-subtle outline-none transition-[box-shadow,border-color] duration-150 ease-out focus-visible:border-accent/50 focus-visible:ring-2 focus-visible:ring-accent/30",
        className,
      )}
      {...props}
    />
  );
}
