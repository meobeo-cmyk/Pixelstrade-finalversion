// Re-export types from shared schema for frontend use
export type {
  User,
  InsertUser,
  LoginUser,
  Transaction,
  InsertTransaction,
  TransactionStep,
  InsertTransactionStep,
  Message,
  InsertMessage,
  Rating,
  InsertRating
} from '@shared/schema';

// Additional frontend-specific types
export interface UserStats {
  completedTransactions: number;
  pendingTransactions: number;
  totalTransactions: number;
  ratingAverage: number;
  ratingCount: number;
  buyingSellingStat: number;
  boostingStat: number;
}

export interface RecentTransaction {
  id: number;
  title: string;
  status: string;
  partnerName: string;
  timeAgo: string;
}

export interface PublicTransaction {
  id: number;
  code: string;
  title: string;
  price: number;
  sellerName: string;
  type: string;
}

export interface TransactionWithPartner extends Transaction {
  sellerName: string;
  buyerName?: string;
  partnerName: string;
  paymentSentAt?: string;
  accountSentAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  steps: string[];
}

export interface TransactionHistoryItem {
  id: number;
  code: string;
  title: string;
  type: string;
  status: string;
  price: number;
  partnerName: string;
  createdAt: string;
}

export interface TransactionHistoryResponse {
  transactions: TransactionHistoryItem[];
  totalCount: number;
  totalPages: number;
}

export interface MessageWithSender extends Message {
  senderName: string;
}

export interface NotificationSettings {
  transactionNotifications: boolean;
  chatNotifications: boolean;
  emailNotifications: boolean;
}
