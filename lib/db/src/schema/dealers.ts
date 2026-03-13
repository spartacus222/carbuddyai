import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dealers = pgTable("dealers", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zip: varchar("zip", { length: 20 }),
  country: varchar("country", { length: 100 }).default("US"),

  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 500 }),

  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  googlePlaceId: varchar("google_place_id", { length: 255 }),

  rating: doublePrecision("rating"),
  reviewCount: integer("review_count").default(0),

  brands: jsonb("brands").$type<string[]>().default([]),
  hours: jsonb("hours").$type<Record<string, string>>().default({}),
  photos: jsonb("photos").$type<string[]>().default([]),
  description: text("description"),

  source: varchar("source", { length: 100 }).default("agent_scan"),
  lastScannedAt: timestamp("last_scanned_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dealerReviews = pgTable("dealer_reviews", {
  id: serial("id").primaryKey(),
  dealerId: integer("dealer_id")
    .notNull()
    .references(() => dealers.id, { onDelete: "cascade" }),

  reviewerName: varchar("reviewer_name", { length: 255 }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  sourceUrl: varchar("source_url", { length: 500 }),
  reviewDate: timestamp("review_date", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertDealerSchema = createInsertSchema(dealers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertDealerReviewSchema = createInsertSchema(dealerReviews).omit({
  id: true,
  createdAt: true,
});

export type Dealer = typeof dealers.$inferSelect;
export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type DealerReview = typeof dealerReviews.$inferSelect;
export type InsertDealerReview = z.infer<typeof insertDealerReviewSchema>;
