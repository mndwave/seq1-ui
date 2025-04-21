import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TooltipPrimitive.Trigger
    asChild
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-secondary data-[state=open]:text-secondary-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </TooltipPrimitive.Trigger>
))
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    className={cn(
      "z-[2147483647] overflow-hidden rounded-md border border-border bg-popover p-2 text-sm text-popover-foreground shadow-sm",
      // Enhanced animation with improved timing and smoothness
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-50 data-[state=closed]:slide-out-to-bottom-2",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2",
      "transition-all duration-300 ease-in-out transform origin-top",
      className,
    )}
    sideOffset={sideOffset}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
