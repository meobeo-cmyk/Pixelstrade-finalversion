import { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

export interface PixelIconProps extends SVGProps<SVGSVGElement> {
  children: ReactNode;
  size?: number;
}

export function PixelIcon({ children, className, size = 24, ...props }: PixelIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={cn("pixel-icon", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export default PixelIcon;
