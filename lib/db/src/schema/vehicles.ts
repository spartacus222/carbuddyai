import { doublePrecision, integer, jsonb, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  trim: varchar("trim", { length: 100 }).notNull(),
  mileage: integer("mileage").notNull(),
  price: integer("price").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  mpg: integer("mpg").notNull(),
  seats: integer("seats").notNull(),
  cargoSpace: doublePrecision("cargo_space").notNull(),
  dealerName: varchar("dealer_name", { length: 200 }).notNull(),
  dealerDistance: doublePrecision("dealer_distance").notNull(),
  dealerRating: doublePrecision("dealer_rating").notNull(),
  priceStatus: varchar("price_status", { length: 50 }).notNull(),
  marketPriceDiff: integer("market_price_diff").notNull(),
  badge: varchar("badge", { length: 100 }).notNull(),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  matchScore: integer("match_score").notNull().default(80),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true });
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
