import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-trading-accent text-white hover:bg-trading-accent/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
        destructive: "bg-bearish text-white hover:bg-bearish/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
        outline: "border-2 border-trading-border bg-transparent text-trading-text hover:bg-trading-card hover:text-white hover:border-trading-accent",
        secondary: "bg-trading-card text-trading-text hover:bg-trading-border hover:text-white shadow-md hover:shadow-lg",
        ghost: "text-trading-text hover:bg-trading-card/50 hover:text-white",
        link: "text-trading-accent underline-offset-4 hover:underline hover:text-trading-accent/80",
        // Trading-specific variants
        bullish: "bg-bullish text-white hover:bg-bullish/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
        bearish: "bg-bearish text-white hover:bg-bearish/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
        gold: "bg-trading-gold text-trading-dark hover:bg-trading-gold/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold",
        premium: "bg-gradient-to-r from-trading-accent to-purple-600 text-white hover:from-trading-accent/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
        ict: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
