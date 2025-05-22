import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()} xu`;
}

export function timeAgo(date: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return `${interval} ${interval === 1 ? "year" : "years"} ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval} ${interval === 1 ? "month" : "months"} ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval} ${interval === 1 ? "day" : "days"} ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} ${interval === 1 ? "hour" : "hours"} ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval} ${interval === 1 ? "minute" : "minutes"} ago`;
  }
  
  return `${Math.floor(seconds)} ${Math.floor(seconds) === 1 ? "second" : "seconds"} ago`;
}

export const colorVariants = {
  'created': 'bg-warning/20 text-warning',
  'payment_sent': 'bg-accent/20 text-accent',
  'item_sent': 'bg-primary/20 text-primary',
  'completed': 'bg-secondary/20 text-secondary',
  'canceled': 'bg-danger/20 text-danger',
  'disputed': 'bg-danger/20 text-danger',
  'buy_sell': 'bg-primary/20 text-primary',
  'boosting': 'bg-accent/20 text-accent',
};

export const statusLabels = {
  'created': 'Created',
  'payment_sent': 'Payment Sent',
  'item_sent': 'Item Sent',
  'completed': 'Completed',
  'canceled': 'Canceled',
  'disputed': 'Disputed',
  'buy_sell': 'Buy/Sell',
  'boosting': 'Boosting',
};

// Generate a pixel art style SVG for avatar
export function generatePixelAvatar(username: string): string {
  const colors = [
    '#8957E5', // primary
    '#43B581', // secondary
    '#FF7042', // accent
    '#F04747', // danger
    '#FAA61A', // warning
  ];
  
  // Get a consistent color based on the username
  const colorIndex = Array.from(username).reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const color = colors[colorIndex];
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <rect width="40" height="40" fill="${color}" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="monospace" font-size="20" font-weight="bold">
        ${username.charAt(0).toUpperCase()}
      </text>
    </svg>
  `;
}

export function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}
