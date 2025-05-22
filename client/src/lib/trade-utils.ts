/**
 * Utility functions for trade-related operations
 */

import { InsertTransaction } from "./types";

/**
 * Converts expiration time string to actual Date object
 * @param expirationTime The string representation of expiration time
 */
export function calculateExpirationDate(expirationTime: string): Date {
  const now = new Date();
  
  switch (expirationTime) {
    case "24h":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "48h":
      return new Date(now.getTime() + 48 * 60 * 60 * 1000);
    case "72h":
      return new Date(now.getTime() + 72 * 60 * 60 * 1000);
    case "1week":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

/**
 * Generates a random 6-character room code
 */
export function generateRoomCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters I, O, 0, 1
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Formats a date to a relative time string (e.g., "2 hours ago")
 * @param date The date to format
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "just now";
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
}

/**
 * Formats a price with thousands separator
 * @param price The price to format
 */
export function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Get transaction type display name
 * @param type Transaction type
 */
export function getTransactionTypeLabel(type: string): string {
  return type === 'buy_sell' ? 'Mua bán' : 'Cày thuê';
}

/**
 * Get transaction status display name
 * @param status Transaction status
 */
export function getTransactionStatusLabel(status: string): string {
  switch (status) {
    case 'created':
      return 'Chờ xác nhận';
    case 'processing':
      return 'Đang xử lý';
    case 'completed':
      return 'Hoàn thành';
    case 'canceled':
      return 'Đã hủy';
    default:
      return status;
  }
}

/**
 * Format price with currency symbol
 * @param price Price value
 */
export function formatCurrency(price: number): string {
  return `${formatPrice(price)} xu`;
}
