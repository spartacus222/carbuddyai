import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { vehicles } from "./vehicles";

export const shortlist = pgTable("shortlist", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertShortlistSchema = createInsertSchema(shortlist).omit({ id: true, createdAt: true });
export type Shortlist = typeof shortlist.$inferSelect;
export type InsertShortlist = z.infer<typeof insertShortlistSchema>;
