import { Router, type IRouter } from "express";
import { eq, lte, and, ilike, or } from "drizzle-orm";
import { db, vehicles } from "@workspace/db";

const router: IRouter = Router();

router.get("/vehicles", async (req, res) => {
  try {
    const { type, maxPrice, maxMileage, query } = req.query as Record<string, string | undefined>;

    let conditions = [];

    if (type) {
      conditions.push(ilike(vehicles.type, `%${type}%`));
    }

    if (maxPrice) {
      const price = parseInt(maxPrice);
      if (!isNaN(price)) conditions.push(lte(vehicles.price, price));
    }

    if (maxMileage) {
      const mileage = parseInt(maxMileage);
      if (!isNaN(mileage)) conditions.push(lte(vehicles.mileage, mileage));
    }

    if (query) {
      conditions.push(
        or(
          ilike(vehicles.make, `%${query}%`),
          ilike(vehicles.model, `%${query}%`),
          ilike(vehicles.trim, `%${query}%`),
          ilike(vehicles.type, `%${query}%`)
        )
      );
    }

    const result = conditions.length > 0
      ? await db.select().from(vehicles).where(and(...conditions))
      : await db.select().from(vehicles);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

router.get("/vehicles/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    if (!vehicle) return void res.status(404).json({ error: "Vehicle not found" });
    res.json(vehicle);
  } catch {
    res.status(500).json({ error: "Failed to fetch vehicle" });
  }
});

export default router;
