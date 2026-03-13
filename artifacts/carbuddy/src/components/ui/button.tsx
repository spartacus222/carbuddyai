import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
    
    const variants = {
      default: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-white/10 bg-transparent hover:bg-white/5 text-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-white/5 hover:text-foreground text-foreground/70",
      link: "text-primary underline-offset-4 hover:underline",
      glass: "bg-white/5 border border-white/10 backdrop-blur-md text-white hover:bg-white/10 shadow-sm"
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-lg px-3",
      lg: "h-11 rounded-xl px-8",
      icon: "h-10 w-10",
    }

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export function buttonVariants({ variant = "default", size = "default", className = "" }: { variant?: ButtonProps["variant"]; size?: ButtonProps["size"]; className?: string } = {}) {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-white/10 bg-transparent hover:bg-white/5 text-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-white/5 hover:text-foreground text-foreground/70",
    link: "text-primary underline-offset-4 hover:underline",
    glass: "bg-white/5 border border-white/10 backdrop-blur-md text-white hover:bg-white/10",
  };
  const sizes: Record<string, string> = { default: "h-10 px-4 py-2", sm: "h-9 rounded-lg px-3", lg: "h-11 rounded-xl px-8", icon: "h-10 w-10" };
  return [baseStyles, variants[variant ?? "default"], sizes[size ?? "default"], className].filter(Boolean).join(" ");
}

export { Button }
