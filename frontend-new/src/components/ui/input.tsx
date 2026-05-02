import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "bg-surface-container-highest/50 border-white/5 focus-visible:border-primary-dim/30 focus-visible:shadow-[0_0_20px_rgba(96,99,238,0.1)] aria-invalid:border-destructive aria-invalid:shadow-[0_0_20px_rgba(255,110,132,0.15)] h-10 rounded-[0.75rem] border px-3 py-2 text-base transition-all duration-300 file:h-8 file:text-sm file:font-medium md:text-sm file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
