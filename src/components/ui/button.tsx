import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding text-sm font-mono font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-muted-foreground active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-white text-[#0A0A0A] border-white hover:bg-[#CCCCCC] active:bg-[#999999]",
        outline: "bg-transparent text-[#CCCCCC] border-[#2A2A2A] hover:bg-[#161616] hover:text-white",
        secondary: "bg-[#111111] text-[#CCCCCC] border-[#2A2A2A] hover:bg-[#161616] hover:text-white",
        ghost: "bg-transparent text-[#666666] border-transparent hover:bg-[#161616] hover:text-white",
        destructive: "bg-transparent text-[#EF4444] border-[#EF4444] hover:bg-[#EF4444]/10",
        link: "text-white underline-offset-4 hover:underline border-none",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-6 px-2 text-xs",
        sm: "h-8 px-3 text-sm",
        lg: "h-11 px-8 text-base",
        icon: "size-9",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
