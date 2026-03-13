import { Router, type IRouter } from "express";
import { eq, ilike, or, and, desc, gte, lte, sql } from "drizzle-orm";
import { db, vehicleListings } from "@workspace/db";
import { z } from "zod";
import { runVehicleScoutAgent } from "../agent/vehicle-scout-agent";

const router: IRouter = Router();

router.post("/agent/vehicle-scout", async (req, res) => {
  const body = z.object({
    make: z.string().min(1),
    model: z.string().min(1),
    yearMin: z.number().int().optional(),
    yearMax: z.number().int().optional(),
    priceMax: z.number().int().optional(),
    location: z.string().min(1),
    maxListings: z.number().int().min(1).max(15).optional(),
  }).parse(req.body);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    await runVehicleScoutAgent(body, res);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.write(`data: ${JSON.stringify({ type: "error", content: msg })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done", content: "Error occurred" })}\n\n`);
  } finally {
    res.end();
  }
});

router.get("/vehicle-listings", async (req, res) => {
  try {
    const { q, make, model, yearMin, yearMax, priceMin, priceMax, condition, location } =
      req.query as Record<string, string | undefined>;

    const conditions = [];

    if (q) {
      conditions.push(
        or(
          ilike(vehicleListings.make, `%${q}%`),
          ilike(vehicleListings.model, `%${q}%`),
          ilike(vehicleListings.trim, `%${q}%`),
          ilike(vehicleListings.dealerName, `%${q}%`),
          ilike(vehicleListings.dealerCity, `%${q}%`),
          ilike(vehicleListings.dealerState, `%${q}%`)
        )
      );
    }

    if (make) conditions.push(ilike(vehicleListings.make, `%${make}%`));
    if (model) conditions.push(ilike(vehicleListings.model, `%${model}%`));
    if (condition) conditions.push(ilike(vehicleListings.condition, condition));
    if (yearMin) conditions.push(gte(vehicleListings.year, parseInt(yearMin)));
    if (yearMax) conditions.push(lte(vehicleListings.year, parseInt(yearMax)));
    if (priceMin) conditions.push(gte(vehicleListings.price, parseInt(priceMin)));
    if (priceMax) conditions.push(lte(vehicleListings.price, parseInt(priceMax)));
    if (location) {
      conditions.push(
        or(
          ilike(vehicleListings.dealerCity, `%${location}%`),
          ilike(vehicleListings.dealerState, `%${location}%`)
        )
      );
    }

    const rows = conditions.length > 0
      ? await db.select().from(vehicleListings).where(and(...conditions)).orderBy(desc(vehicleListings.scannedAt))
      : await db.select().from(vehicleListings).orderBy(desc(vehicleListings.scannedAt));

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

router.get("/vehicle-listings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [listing] = await db.select().from(vehicleListings).where(eq(vehicleListings.id, id));
    if (!listing) return void res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch {
    res.status(500).json({ error: "Failed to fetch listing" });
  }
});

router.delete("/vehicle-listings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await db.delete(vehicleListings).where(eq(vehicleListings.id, id)).returning();
    if (!deleted.length) return void res.status(404).json({ error: "Listing not found" });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

router.get("/vehicle-listings/stats/summary", async (_req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*)::int as total,
        COUNT(DISTINCT make || ' ' || model)::int as unique_models,
        MIN(price) as min_price,
        MAX(price) as max_price,
        ROUND(AVG(price))::int as avg_price,
        COUNT(DISTINCT dealer_name)::int as unique_dealers
      FROM vehicle_listings
      WHERE price IS NOT NULL
    `);
    res.json(result.rows[0] ?? {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
