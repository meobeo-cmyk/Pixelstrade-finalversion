import * as React from "react";
import { cn } from "@/lib/utils";

interface PixelProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export function PixelProgress({ value, max = 100, className }: PixelProgressProps) {
  const percentage = (value / max) * 100;

  return (
    <div className={cn("w-full pixel-progress rounded-sm overflow-hidden", className)}>
      <div
        className="pixel-progress-fill"
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  );
}

export default PixelProgress;
