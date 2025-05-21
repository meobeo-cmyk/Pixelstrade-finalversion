import { PixelIcon } from "@/components/ui/pixel-icon";

// Game controller icon
export function GameControllerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <PixelIcon {...props}>
      <rect x="6" y="12" width="12" height="8" />
      <rect x="8" y="10" width="8" height="2" />
      <rect x="9" y="16" width="2" height="2" />
      <rect x="13" y="16" width="2" height="2" />
      <rect x="7" y="14" width="2" height="2" />
      <rect x="15" y="14" width="2" height="2" />
    </PixelIcon>
  );
}

// Currency/coin icon
export function CoinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <PixelIcon {...props}>
      <rect x="8" y="6" width="8" height="12" rx="4" ry="6" />
      <rect x="10" y="10" width="4" height="4" rx="2" ry="2" />
    </PixelIcon>
  );
}

// Trade/Exchange icon
export function TradeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <PixelIcon {...props}>
      <path d="M7 10 H17" />
      <path d="M17 14 H7" />
      <path d="M4 10 L7 7 L10 10" />
      <path d="M20 14 L17 17 L14 14" />
    </PixelIcon>
  );
}

// Boost/Level Up icon
export function BoostIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <PixelIcon {...props}>
      <path d="M12 20 L12 4" />
      <path d="M6 10 L12 4 L18 10" />
    </PixelIcon>
  );
}

// Code/Join icon
export function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <PixelIcon {...props}>
      <path d="M8 8 L4 12 L8 16" />
      <path d="M16 8 L20 12 L16 16" />
      <path d="M10 20 L14 4" />
    </PixelIcon>
  );
}

// History icon
export function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <PixelIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8 L12 12 L15 15" />
    </PixelIcon>
  );
}
