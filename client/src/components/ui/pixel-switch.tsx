import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface PixelSwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  onColor?: string;
  offColor?: string;
}

const PixelSwitch = forwardRef<HTMLInputElement, PixelSwitchProps>(
  ({ className, onColor = "bg-primary", offColor = "bg-muted", ...props }, ref) => {
    return (
      <label className="inline-flex relative items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          {...props}
        />
        <div className={cn(
          "w-12 h-6 rounded-full transition-colors",
          props.checked ? onColor : offColor,
          "after:content-[''] after:absolute after:top-[3px] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-all",
          props.checked ? "after:left-[27px]" : "after:left-[3px]",
          className
        )}></div>
      </label>
    );
  }
);

PixelSwitch.displayName = "PixelSwitch";

export { PixelSwitch };
