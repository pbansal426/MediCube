"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils"; // Or wherever your cn() utility is

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {}

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, ...props }, ref) => {
  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full bg-muted ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 data-[state=checked]:bg-primary",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
          "data-[state=checked]:translate-x-[16px]"
        )}
      />
    </SwitchPrimitives.Root>
  );
});

Switch.displayName = "Switch";
