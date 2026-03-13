import {
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

export const vehicleListings = pgTable("vehicle_listings", {
  id: serial("id").primaryKey(),

  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  trim: varchar("trim", { length: 255 }),
  condition: varchar("condition", { length: 50 }).default("used"),
  type: varchar("type", { length: 50 }),
  color: varchar("color", { length: 100 }),
  vin: varchar("vin", { length: 50 }),

  price: integer("price"),
  mileage: integer("mileage"),

  dealerName: varchar("dealer_name", { length: 255 }),
  dealerAddress: varchar("dealer_address", { length: 500 }),
  dealerCity: varchar("dealer_city", { length: 100 }),
  dealerState: varchar("dealer_state", { length: 100 }),
  dealerPhone: varchar("dealer_phone", { length: 50 }),
  dealerWebsite: varchar("dealer_website", { length: 500 }),

  sourceUrl: varchar("source_url", { length: 1000 }),
  sourceSite: varchar("source_site", { length: 100 }),

  features: jsonb("features").$type<string[]>().default([]),
  description: text("description"),

  scannedAt: timestamp("scanned_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertVehicleListingSchema = createInsertSchema(vehicleListings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type VehicleListing = typeof vehicleListings.$inferSelect;
export type InsertVehicleListing = z.infer<typeof insertVehicleListingSchema>;
