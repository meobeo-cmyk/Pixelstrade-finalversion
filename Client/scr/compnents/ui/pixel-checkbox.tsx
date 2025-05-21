import * as React from "react";
import { cn } from "@/lib/utils";

export interface PixelCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PixelCheckbox = React.forwardRef<HTMLInputElement, PixelCheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(
          "appearance-none w-6 h-6 border-2 border-primary bg-card relative cursor-pointer checked:bg-primary",
          "after:content-[''] after:absolute after:top-1 after:left-1 after:w-3 after:h-3 after:scale-0 checked:after:scale-100 after:bg-secondary after:transition-transform",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

PixelCheckbox.displayName = "PixelCheckbox";

export { PixelCheckbox };
