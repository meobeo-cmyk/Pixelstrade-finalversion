import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  age: integer("age").notNull(),
  password: text("password").notNull(),
  balance: integer("balance").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    name: true,
    email: true,
    age: true,
    password: true,
  })
  .extend({
    age: z.number().min(10, "You must be at least 10 years old"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  type: text("type").notNull(), // 'buy_sell' or 'boosting'
  status: text("status").notNull(), // 'created', 'processing', 'completed', 'canceled'
  sellerId: integer("seller_id").notNull().references(() => users.id),
  buyerId: integer("buyer_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  accountDetails: text("account_details"),
});

export const insertTransactionSchema = createInsertSchema(transactions)
  .pick({
    title: true,
    description: true,
    price: true,
    type: true,
    expiresAt: true,
  })
  .extend({
    expirationTime: z.enum(["24h", "48h", "72h", "1week"]),
  })
  .omit({ expiresAt: true });

// Transaction progress schema
export const transactionSteps = pgTable("transaction_steps", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id")
    .notNull()
    .references(() => transactions.id),
  step: text("step").notNull(), // 'created', 'payment_sent', 'account_sent', 'completed'
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  completedBy: integer("completed_by")
    .notNull()
    .references(() => users.id),
});

export const insertTransactionStepSchema = createInsertSchema(transactionSteps)
  .pick({
    transactionId: true,
    step: true,
    completedBy: true,
  });

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id")
    .notNull()
    .references(() => transactions.id),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages)
  .pick({
    transactionId: true,
    senderId: true,
    content: true,
  });

// Ratings schema
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id")
    .notNull()
    .references(() => transactions.id),
  raterId: integer("rater_id")
    .notNull()
    .references(() => users.id),
  targetId: integer("target_id")
    .notNull()
    .references(() => users.id),
  score: integer("score").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRatingSchema = createInsertSchema(ratings)
  .pick({
    transactionId: true,
    raterId: true,
    targetId: true,
    score: true,
    comment: true,
  });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type TransactionStep = typeof transactionSteps.$inferSelect;
export type InsertTransactionStep = z.infer<typeof insertTransactionStepSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
