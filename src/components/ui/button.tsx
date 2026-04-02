import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_16px_32px_hsl(79_100%_62%_/_0.28)] hover:-translate-y-0.5 hover:shadow-[0_20px_36px_hsl(79_100%_62%_/_0.34)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_14px_28px_hsl(0_82%_60%_/_0.28)] hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border border-input bg-card/90 text-card-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%_/_0.04)] hover:border-primary/40 hover:bg-card",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_12px_26px_hsl(220_35%_2%_/_0.22)] hover:-translate-y-0.5 hover:bg-secondary/90",
        ghost: "text-foreground hover:bg-secondary/80 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-sm",
        icon: "h-11 w-11",
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
