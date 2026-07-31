import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerUpiId: text("customer_upi_id").notNull(),
  amount: integer("amount").notNull(),           // in rupees
  cashbackAmount: integer("cashback_amount").notNull(), // 2% of amount
  status: text("status").notNull().default("pending"), // pending | paid | rejected
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Payment = typeof paymentsTable.$inferSelect;
