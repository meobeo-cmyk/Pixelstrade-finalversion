import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import session from "express-session";
import { z } from "zod";
import bcrypt from "bcrypt";
import { 
  loginSchema, 
  insertUserSchema, 
  insertTransactionSchema, 
  insertMessageSchema,
  insertTransactionStepSchema
} from "@shared/schema";
import { generateRoomCode, calculateExpirationDate } from "../client/src/lib/trade-utils";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "pixelstrade-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 } // 1 day
    })
  );

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { usernameOrEmail, password } = loginSchema.parse(req.body);
      
      // Find user by username or email
      let user = await storage.getUserByUsername(usernameOrEmail);
      if (!user) {
        user = await storage.getUserByEmail(usernameOrEmail);
      }
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user ID in session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user information" });
    }
  });

  app.patch("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const allowedFields = ["name", "email"];
      const updates: Record<string, any> = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      const updatedUser = await storage.updateUser(req.session.userId, updates);
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.post("/api/auth/change-password", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Get current user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await storage.updateUser(req.session.userId, { password: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Transaction Routes
  app.post("/api/transactions", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Generate a unique code for the transaction
      const code = generateRoomCode();
      
      // Calculate expiration date based on expirationTime field
      const expiresAt = calculateExpirationDate(validatedData.expirationTime);
      
      // Create transaction
      const transaction = await storage.createTransaction({
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        type: validatedData.type,
        code,
        sellerId: req.session.userId,
        status: "created",
        expiresAt
      });
      
      // Create initial transaction step
      await storage.createTransactionStep({
        transactionId: transaction.id,
        step: "created",
        completedBy: req.session.userId
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.post("/api/transactions/join", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Invalid code" });
      }
      
      // Find transaction by code
      const transaction = await storage.getTransactionByCode(code);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Check if transaction has already expired
      if (new Date(transaction.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Transaction has expired" });
      }
      
      // Check if transaction already has a buyer
      if (transaction.buyerId) {
        // If current user is the buyer, just return the transaction
        if (transaction.buyerId === req.session.userId) {
          return res.json(transaction);
        }
        return res.status(400).json({ message: "Transaction already has a buyer" });
      }
      
      // Check that the user is not joining their own transaction
      if (transaction.sellerId === req.session.userId) {
        return res.status(400).json({ message: "Cannot join your own transaction" });
      }
      
      // Join the transaction as buyer
      const updatedTransaction = await storage.updateTransaction(transaction.id, {
        buyerId: req.session.userId,
        status: "processing"
      });
      
      // Create a transaction step for payment
      await storage.createTransactionStep({
        transactionId: transaction.id,
        step: "payment_sent",
        completedBy: req.session.userId
      });
      
      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to join transaction" });
    }
  });

  app.get("/api/transactions/recent", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const recentTransactions = await storage.getRecentTransactionsByUserId(req.session.userId);
      res.json(recentTransactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  app.get("/api/transactions/public", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const publicTransactions = await storage.getPublicTransactions();
      res.json(publicTransactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch public transactions" });
    }
  });

  app.get("/api/transactions/history", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { type = 'all', sort = 'newest', page = '1' } = req.query as Record<string, string>;
      const pageNumber = parseInt(page, 10) || 1;
      const userId = req.session.userId;
      
      const result = await storage.getTransactionHistory(userId, type, sort, pageNumber);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction history" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const transactionId = parseInt(req.params.id, 10);
      
      // Get the transaction with details
      const transaction = await storage.getTransactionDetails(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Check if the user is authorized to view this transaction
      if (transaction.sellerId !== req.session.userId && transaction.buyerId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to view this transaction" });
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions/:id/account", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const transactionId = parseInt(req.params.id, 10);
      const { details } = req.body;
      
      if (!details || typeof details !== "string") {
        return res.status(400).json({ message: "Account details are required" });
      }
      
      // Get transaction
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Check if user is the seller
      if (transaction.sellerId !== req.session.userId) {
        return res.status(403).json({ message: "Only the seller can send account details" });
      }
      
      // Check transaction status
      if (transaction.status !== "processing") {
        return res.status(400).json({ message: "Transaction is not in processing state" });
      }
      
      // Update transaction with account details
      await storage.updateTransaction(transactionId, {
        accountDetails: details
      });
      
      // Create a transaction step for account sent
      await storage.createTransactionStep({
        transactionId,
        step: "account_sent",
        completedBy: req.session.userId
      });
      
      res.json({ message: "Account details sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send account details" });
    }
  });

  app.post("/api/transactions/:id/confirm", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const transactionId = parseInt(req.params.id, 10);
      
      // Get transaction
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Check if user is the buyer
      if (transaction.buyerId !== req.session.userId) {
        return res.status(403).json({ message: "Only the buyer can confirm receipt" });
      }
      
      // Check transaction status
      if (transaction.status !== "processing") {
        return res.status(400).json({ message: "Transaction is not in processing state" });
      }
      
      // Check if account details are provided
      if (!transaction.accountDetails) {
        return res.status(400).json({ message: "Seller hasn't provided account details yet" });
      }
      
      // Update transaction status to completed
      await storage.updateTransaction(transactionId, {
        status: "completed"
      });
      
      // Create transaction steps for confirmation and completion
      await storage.createTransactionStep({
        transactionId,
        step: "confirmed",
        completedBy: req.session.userId
      });
      
      await storage.createTransactionStep({
        transactionId,
        step: "completed",
        completedBy: req.session.userId
      });
      
      // Transfer payment to seller
      const seller = await storage.getUser(transaction.sellerId);
      if (seller) {
        await storage.updateUser(seller.id, {
          balance: seller.balance + transaction.price
        });
      }
      
      res.json({ message: "Transaction completed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to confirm transaction" });
    }
  });

  app.post("/api/transactions/:id/cancel", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const transactionId = parseInt(req.params.id, 10);
      
      // Get transaction
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Check if user is the seller or buyer
      if (transaction.sellerId !== req.session.userId && transaction.buyerId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to cancel this transaction" });
      }
      
      // Check if transaction can be canceled
      if (transaction.status === "completed" || transaction.status === "canceled") {
        return res.status(400).json({ message: "Cannot cancel a completed or already canceled transaction" });
      }
      
      // Cancel the transaction
      await storage.updateTransaction(transactionId, {
        status: "canceled"
      });
      
      // If there was a buyer, refund them
      if (transaction.buyerId && transaction.status === "processing") {
        const buyer = await storage.getUser(transaction.buyerId);
        if (buyer) {
          await storage.updateUser(buyer.id, {
            balance: buyer.balance + transaction.price
          });
        }
      }
      
      res.json({ message: "Transaction canceled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel transaction" });
    }
  });

  app.post("/api/transactions/:id/report", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const transactionId = parseInt(req.params.id, 10);
      const { reason } = req.body;
      
      if (!reason || typeof reason !== "string") {
        return res.status(400).json({ message: "Report reason is required" });
      }
      
      // Get transaction
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Check if user is the seller or buyer
      if (transaction.sellerId !== req.session.userId && transaction.buyerId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to report this transaction" });
      }
      
      // Store the report
      await storage.createReport({
        transactionId,
        userId: req.session.userId,
        reason
      });
      
      res.json({ message: "Report submitted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit report" });
    }
  });

  // Message routes
  app.get("/api/transactions/:id/messages", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const transactionId = parseInt(req.params.id, 10);
      
      // Get transaction
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Check if user is the seller or buyer
      if (transaction.sellerId !== req.session.userId && transaction.buyerId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to view messages for this transaction" });
      }
      
      // Get messages
      const messages = await storage.getMessagesByTransactionId(transactionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/transactions/:id/messages", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const transactionId = parseInt(req.params.id, 10);
      const { content } = req.body;
      
      if (!content || typeof content !== "string") {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // Get transaction
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Check if user is the seller or buyer
      if (transaction.sellerId !== req.session.userId && transaction.buyerId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to send messages for this transaction" });
      }
      
      // Create message
      const message = await storage.createMessage({
        transactionId,
        senderId: req.session.userId,
        content
      });
      
      // Get sender info
      const sender = await storage.getUser(req.session.userId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }
      
      const messageWithSender = {
        ...message,
        senderName: sender.name
      };
      
      res.status(201).json(messageWithSender);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // User stats
  app.get("/api/users/stats", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const stats = await storage.getUserStats(req.session.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
