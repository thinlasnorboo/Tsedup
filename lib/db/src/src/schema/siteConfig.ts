import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const siteConfigTable = pgTable("site_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
});

export type SiteConfig = typeof siteConfigTable.$inferSelect;
