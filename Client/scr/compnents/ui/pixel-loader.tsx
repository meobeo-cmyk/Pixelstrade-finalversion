import { cn } from "@/lib/utils";

interface PixelLoaderProps {
  className?: string;
}

export function PixelLoader({ className }: PixelLoaderProps) {
  return (
    <div className={cn("w-16 h-4 flex justify-between", className)}>
      <span className="w-3 h-3 bg-primary animate-[pixel-loading_1s_infinite_alternate_ease-in-out]"></span>
      <span className="w-3 h-3 bg-primary animate-[pixel-loading_1s_infinite_alternate_ease-in-out_0.2s]"></span>
      <span className="w-3 h-3 bg-primary animate-[pixel-loading_1s_infinite_alternate_ease-in-out_0.4s]"></span>
      <span className="w-3 h-3 bg-primary animate-[pixel-loading_1s_infinite_alternate_ease-in-out_0.6s]"></span>
    </div>
  );
}

export default PixelLoader;
