import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const visitsTable = pgTable("visits", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  visitedAt: timestamp("visited_at").defaultNow().notNull(),
});
