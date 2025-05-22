import React from "react";
import { cn } from "@/lib/utils";

interface PixelBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function PixelBorder({ children, className }: PixelBorderProps) {
  return (
    <div className={cn("pixel-border", className)}>
      {children}
    </div>
  );
}

export default PixelBorder;
