import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const pixelButtonVariants = cva(
  "relative transition-all duration-100 ease-in-out transform translate-x-0 translate-y-0 shadow-[4px_4px_0_#1A1C2C] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#1A1C2C] font-medium inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-medium ring-offset-background disabled:pointer-events-none disabled:opacity-50 font-pixel",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pixelButtonVariants> {
  asChild?: boolean;
}

const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(pixelButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

PixelButton.displayName = "PixelButton";

export { PixelButton, pixelButtonVariants };
