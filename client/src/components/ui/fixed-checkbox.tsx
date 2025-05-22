import * as React from "react";
import { cn } from "@/lib/utils";

export interface FixedCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const FixedCheckbox = React.forwardRef<HTMLInputElement, FixedCheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    // Handle both onChange (standard HTML) and onCheckedChange (React form libraries)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
      
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
    };

    return (
      <input
        type="checkbox"
        className={cn(
          "appearance-none w-6 h-6 border-2 border-primary bg-card relative cursor-pointer checked:bg-primary",
          "after:content-[''] after:absolute after:top-1 after:left-1 after:w-3 after:h-3 after:scale-0 checked:after:scale-100 after:bg-secondary after:transition-transform",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

FixedCheckbox.displayName = "FixedCheckbox";

export { FixedCheckbox };