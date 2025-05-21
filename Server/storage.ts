import { 
  users, 
  transactions, 
  transactionSteps, 
  messages, 
  ratings,
  type User, 
  type InsertUser, 
  type Transaction, 
  type TransactionStep, 
  type InsertTransactionStep, 
  type Message, 
  type InsertMessage, 
  type Rating, 
  type InsertRating 
} from "@shared/schema";
import { formatRelativeTime } from "../client/src/lib/trade-utils";

// Define report type
type Report = {
  id: number;
  transactionId: number;
  userId: number;
  reason: string;
  createdAt: Date;
};

type InsertReport = Omit<Report, "id" | "createdAt">;

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  getUserStats(userId: number): Promise<any>;

  // Transaction operations
  createTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByCode(code: string): Promise<Transaction | undefined>;
  updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction>;
  getTransactionDetails(id: number): Promise<any>;
  getRecentTransactionsByUserId(userId: number): Promise<any[]>;
  getPublicTransactions(): Promise<any[]>;
  getTransactionHistory(userId: number, type: string, sort: string, page: number): Promise<any>;

  // Transaction steps operations
  createTransactionStep(step: InsertTransactionStep): Promise<TransactionStep>;
  getTransactionSteps(transactionId: number): Promise<TransactionStep[]>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByTransactionId(transactionId: number): Promise<any[]>;

  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  getRatingsByUserId(userId: number): Promise<Rating[]>;

  // Report operations
  createReport(report: InsertReport): Promise<Report>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private transactionSteps: Map<number, TransactionStep>;
  private messages: Map<number, Message>;
  private ratings: Map<number, Rating>;
  private reports: Map<number, Report>;
  private userIdCounter: number;
  private transactionIdCounter: number;
  private stepIdCounter: number;
  private messageIdCounter: number;
  private ratingIdCounter: number;
  private reportIdCounter: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.transactionSteps = new Map();
    this.messages = new Map();
    this.ratings = new Map();
    this.reports = new Map();
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.stepIdCounter = 1;
    this.messageIdCounter = 1;
    this.ratingIdCounter = 1;
    this.reportIdCounter = 1;

    // Add some initial users for testing
    this.createUser({
      username: "admin",
      name: "Admin User",
      email: "admin@pixelstrade.com",
      age: 25,
      password: "$2b$10$EYWJAGMSOyeWNQOb9aoiIedDJJk6rvk4k7JgvZ0EJTZEgmJ3YGZ7a", // hashed "password123"
      balance: 10000,
    });

    this.createUser({
      username: "user",
      name: "Regular User",
      email: "user@pixelstrade.com",
      age: 18,
      password: "$2b$10$EYWJAGMSOyeWNQOb9aoiIedDJJk6rvk4k7JgvZ0EJTZEgmJ3YGZ7a", // hashed "password123"
      balance: 5000,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      id,
      ...userData,
      balance: userData.balance || 0,
      createdAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserStats(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    // Get all transactions where user is seller or buyer
    const userTransactions = Array.from(this.transactions.values()).filter(
      (tx) => tx.sellerId === userId || tx.buyerId === userId
    );

    // Count completed transactions
    const completedTransactions = userTransactions.filter(
      (tx) => tx.status === "completed"
    ).length;

    // Count pending transactions
    const pendingTransactions = userTransactions.filter(
      (tx) => tx.status === "processing"
    ).length;

    // Get ratings received by the user
    const userRatings = Array.from(this.ratings.values()).filter(
      (rating) => rating.targetId === userId
    );

    // Calculate average rating
    const ratingAverage = userRatings.length > 0
      ? parseFloat((userRatings.reduce((sum, r) => sum + r.score, 0) / userRatings.length).toFixed(1))
      : 0;

    // Calculate transaction type statistics
    const buySellingTransactions = userTransactions.filter(
      (tx) => tx.type === "buy_sell"
    ).length;
    const boostingTransactions = userTransactions.filter(
      (tx) => tx.type === "boosting"
    ).length;

    const totalTransactions = buySellingTransactions + boostingTransactions;
    const buyingSellingStat = totalTransactions > 0
      ? Math.round((buySellingTransactions / totalTransactions) * 100)
      : 50;
    const boostingStat = totalTransactions > 0
      ? Math.round((boostingTransactions / totalTransactions) * 100)
      : 50;

    return {
      completedTransactions,
      pendingTransactions,
      totalTransactions: userTransactions.length,
      ratingAverage,
      ratingCount: userRatings.length,
      buyingSellingStat,
      boostingStat
    };
  }

  // Transaction operations
  async createTransaction(transactionData: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    const transaction: Transaction = {
      id,
      ...transactionData,
      createdAt: now,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionByCode(code: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (tx) => tx.code === code
    );
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction> {
    const transaction = await this.getTransaction(id);
    if (!transaction) {
      throw new Error(`Transaction with id ${id} not found`);
    }

    const updatedTransaction = { ...transaction, ...updates };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async getTransactionDetails(id: number): Promise<any> {
    const transaction = await this.getTransaction(id);
    if (!transaction) {
      return undefined;
    }

    // Get transaction steps
    const steps = await this.getTransactionSteps(id);
    const completedSteps = steps.map(step => step.step);

    // Get seller and buyer info
    const seller = await this.getUser(transaction.sellerId);
    const buyer = transaction.buyerId ? await this.getUser(transaction.buyerId) : undefined;

    // Format step timestamps
    const createdStep = steps.find(step => step.step === "created");
    const paymentSentStep = steps.find(step => step.step === "payment_sent");
    const accountSentStep = steps.find(step => step.step === "account_sent");
    const confirmedStep = steps.find(step => step.step === "confirmed");
    const completedStep = steps.find(step => step.step === "completed");

    return {
      ...transaction,
      sellerName: seller?.name || "Unknown Seller",
      buyerName: buyer?.name,
      steps: completedSteps,
      paymentSentAt: paymentSentStep ? formatTimestamp(paymentSentStep.completedAt) : undefined,
      accountSentAt: accountSentStep ? formatTimestamp(accountSentStep.completedAt) : undefined,
      confirmedAt: confirmedStep ? formatTimestamp(confirmedStep.completedAt) : undefined,
      completedAt: completedStep ? formatTimestamp(completedStep.completedAt) : undefined,
    };
  }

  async getRecentTransactionsByUserId(userId: number): Promise<any[]> {
    // Get transactions where user is seller or buyer, ordered by createdAt desc
    const userTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.sellerId === userId || tx.buyerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5); // Get only the most recent 5

    // Format transactions for display
    const formattedTransactions = await Promise.all(
      userTransactions.map(async tx => {
        const partnerId = tx.sellerId === userId ? tx.buyerId : tx.sellerId;
        const partner = partnerId ? await this.getUser(partnerId) : undefined;

        return {
          id: tx.id,
          title: tx.title,
          status: tx.status,
          partnerName: partner?.name || "Unknown User",
          timeAgo: formatRelativeTime(tx.createdAt)
        };
      })
    );

    return formattedTransactions;
  }

  async getPublicTransactions(): Promise<any[]> {
    // Get active transactions that don't have a buyer yet
    const publicTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.status === "created" && !tx.buyerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5); // Get only the most recent 5

    // Format transactions for display
    const formattedTransactions = await Promise.all(
      publicTransactions.map(async tx => {
        const seller = await this.getUser(tx.sellerId);

        return {
          id: tx.id,
          code: tx.code,
          title: tx.title,
          price: tx.price,
          sellerName: seller?.name || "Unknown Seller",
          type: tx.type
        };
      })
    );

    return formattedTransactions;
  }

  async getTransactionHistory(userId: number, type: string, sort: string, page: number): Promise<any> {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // Get transactions where user is seller or buyer
    let userTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.sellerId === userId || tx.buyerId === userId);

    // Filter by type if specified
    if (type !== 'all') {
      userTransactions = userTransactions.filter(tx => tx.type === type);
    }

    // Sort transactions
    userTransactions = sortTransactions(userTransactions, sort);

    // Get total count
    const totalCount = userTransactions.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Paginate
    const paginatedTransactions = userTransactions.slice(skip, skip + pageSize);

    // Format transactions for display
    const formattedTransactions = await Promise.all(
      paginatedTransactions.map(async tx => {
        const partnerId = tx.sellerId === userId ? tx.buyerId : tx.sellerId;
        const partner = partnerId ? await this.getUser(partnerId) : undefined;

        return {
          id: tx.id,
          code: tx.code,
          title: tx.title,
          type: tx.type,
          status: tx.status,
          price: tx.price,
          partnerName: partner?.name || "Unknown User",
          createdAt: tx.createdAt
        };
      })
    );

    return {
      transactions: formattedTransactions,
      totalCount,
      totalPages
    };
  }

  // Transaction steps operations
  async createTransactionStep(stepData: InsertTransactionStep): Promise<TransactionStep> {
    const id = this.stepIdCounter++;
    const now = new Date();
    const step: TransactionStep = {
      id,
      ...stepData,
      completedAt: now,
    };
    this.transactionSteps.set(id, step);
    return step;
  }

  async getTransactionSteps(transactionId: number): Promise<TransactionStep[]> {
    return Array.from(this.transactionSteps.values())
      .filter(step => step.transactionId === transactionId)
      .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = {
      id,
      ...messageData,
      createdAt: now,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByTransactionId(transactionId: number): Promise<any[]> {
    const messagesForTransaction = Array.from(this.messages.values())
      .filter(msg => msg.transactionId === transactionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Add sender names
    const messagesWithSenders = await Promise.all(
      messagesForTransaction.map(async msg => {
        const sender = await this.getUser(msg.senderId);
        return {
          ...msg,
          senderName: sender?.name || "Unknown User"
        };
      })
    );

    return messagesWithSenders;
  }

  // Rating operations
  async createRating(ratingData: InsertRating): Promise<Rating> {
    const id = this.ratingIdCounter++;
    const now = new Date();
    const rating: Rating = {
      id,
      ...ratingData,
      createdAt: now,
    };
    this.ratings.set(id, rating);
    return rating;
  }

  async getRatingsByUserId(userId: number): Promise<Rating[]> {
    return Array.from(this.ratings.values())
      .filter(rating => rating.targetId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Report operations
  async createReport(reportData: InsertReport): Promise<Report> {
    const id = this.reportIdCounter++;
    const now = new Date();
    const report: Report = {
      id,
      ...reportData,
      createdAt: now,
    };
    this.reports.set(id, report);
    return report;
  }
}

// Helper functions
function formatTimestamp(date: Date): string {
  return new Date(date).toLocaleString();
}

function sortTransactions(transactions: Transaction[], sort: string): Transaction[] {
  switch (sort) {
    case 'newest':
      return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return transactions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'highest_price':
      return transactions.sort((a, b) => b.price - a.price);
    case 'lowest_price':
      return transactions.sort((a, b) => a.price - b.price);
    default:
      return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const storage = new MemStorage();
