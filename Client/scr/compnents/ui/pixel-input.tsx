import * as React from "react";
import { cn } from "@/lib/utils";

export interface PixelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PixelInput = React.forwardRef<HTMLInputElement, PixelInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full px-3 py-2 bg-card border-2 border-border rounded focus:border-primary focus:outline-none text-foreground",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

PixelInput.displayName = "PixelInput";

export { PixelInput };
