import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, shortlist, vehicles } from "@workspace/db";
import { AddToShortlistBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/shortlist", async (_req, res) => {
  try {
    const entries = await db
      .select({
        id: shortlist.id,
        vehicleId: shortlist.vehicleId,
        createdAt: shortlist.createdAt,
        vehicle: vehicles,
      })
      .from(shortlist)
      .innerJoin(vehicles, eq(shortlist.vehicleId, vehicles.id))
      .orderBy(shortlist.createdAt);

    const result = entries.map((e) => ({
      id: e.id,
      vehicleId: e.vehicleId,
      createdAt: e.createdAt,
      vehicle: e.vehicle,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shortlist" });
  }
});

router.post("/shortlist", async (req, res) => {
  try {
    const body = AddToShortlistBody.parse(req.body);

    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, body.vehicleId));
    if (!vehicle) return void res.status(404).json({ error: "Vehicle not found" });

    const existing = await db.select().from(shortlist).where(eq(shortlist.vehicleId, body.vehicleId));
    if (existing.length > 0) {
      return void res.status(201).json({ id: existing[0].id, vehicleId: existing[0].vehicleId, createdAt: existing[0].createdAt, vehicle });
    }

    const [entry] = await db.insert(shortlist).values({ vehicleId: body.vehicleId }).returning();
    res.status(201).json({ ...entry, vehicle });
  } catch (err) {
    res.status(400).json({ error: "Invalid request body" });
  }
});

router.delete("/shortlist/:vehicleId", async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);
    await db.delete(shortlist).where(eq(shortlist.vehicleId, vehicleId));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to remove from shortlist" });
  }
});

export default router;
