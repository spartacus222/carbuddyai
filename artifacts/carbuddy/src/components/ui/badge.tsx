import * as React from "react"
import { cn } from "./button"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "glass"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  
  const variants = {
    default: "bg-primary border-transparent text-primary-foreground shadow",
    secondary: "bg-secondary border-transparent text-secondary-foreground",
    destructive: "bg-destructive border-transparent text-destructive-foreground shadow",
    outline: "text-foreground border border-white/10",
    glass: "bg-white/5 border border-white/10 backdrop-blur-md text-white/90"
  }

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props} />
  )
}

export { Badge }
