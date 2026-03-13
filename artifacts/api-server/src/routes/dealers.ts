import { Router, type IRouter } from "express";
import { eq, ilike, or, desc, and, isNotNull } from "drizzle-orm";
import { db, dealers, dealerReviews } from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

const UpsertDealerBody = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  googlePlaceId: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().optional(),
  brands: z.array(z.string()).optional(),
  hours: z.record(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  description: z.string().optional(),
  source: z.string().optional(),
});

const AddReviewBody = z.object({
  reviewerName: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  sourceUrl: z.string().optional(),
  reviewDate: z.string().optional(),
});

router.get("/dealers", async (req, res) => {
  try {
    const { q, city, state, brand } = req.query as Record<string, string | undefined>;

    let conditions = [];
    if (q) {
      conditions.push(
        or(
          ilike(dealers.name, `%${q}%`),
          ilike(dealers.address, `%${q}%`),
          ilike(dealers.city, `%${q}%`)
        )
      );
    }
    if (city) conditions.push(ilike(dealers.city, `%${city}%`));
    if (state) conditions.push(ilike(dealers.state, `%${state}%`));

    const rows = conditions.length > 0
      ? await db.select().from(dealers).where(and(...conditions)).orderBy(desc(dealers.createdAt))
      : await db.select().from(dealers).orderBy(desc(dealers.createdAt));

    const filtered = brand
      ? rows.filter(d => d.brands?.some((b: string) => b.toLowerCase().includes(brand.toLowerCase())))
      : rows;

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dealers" });
  }
});

router.get("/dealers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id));
    if (!dealer) return void res.status(404).json({ error: "Dealer not found" });

    const reviews = await db
      .select()
      .from(dealerReviews)
      .where(eq(dealerReviews.dealerId, id))
      .orderBy(desc(dealerReviews.createdAt));

    res.json({ ...dealer, reviews });
  } catch {
    res.status(500).json({ error: "Failed to fetch dealer" });
  }
});

router.post("/dealers", async (req, res) => {
  try {
    const body = UpsertDealerBody.parse(req.body);

    const existing = body.website
      ? await db.select().from(dealers).where(ilike(dealers.website, body.website))
      : [];

    if (existing.length > 0) {
      const [updated] = await db
        .update(dealers)
        .set({ ...body, updatedAt: new Date(), lastScannedAt: new Date() })
        .where(eq(dealers.id, existing[0].id))
        .returning();
      return void res.status(200).json(updated);
    }

    const [created] = await db
      .insert(dealers)
      .values({ ...body, lastScannedAt: new Date() })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return void res.status(400).json({ error: "Invalid input", details: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create dealer" });
  }
});

router.patch("/dealers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = UpsertDealerBody.partial().parse(req.body);

    const [updated] = await db
      .update(dealers)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(dealers.id, id))
      .returning();

    if (!updated) return void res.status(404).json({ error: "Dealer not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update dealer" });
  }
});

router.delete("/dealers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await db.delete(dealers).where(eq(dealers.id, id)).returning();
    if (!deleted.length) return void res.status(404).json({ error: "Dealer not found" });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete dealer" });
  }
});

router.post("/dealers/:id/reviews", async (req, res) => {
  try {
    const dealerId = parseInt(req.params.id);
    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, dealerId));
    if (!dealer) return void res.status(404).json({ error: "Dealer not found" });

    const body = AddReviewBody.parse(req.body);

    const [review] = await db
      .insert(dealerReviews)
      .values({
        dealerId,
        ...body,
        reviewDate: body.reviewDate ? new Date(body.reviewDate) : undefined,
      })
      .returning();

    const allReviews = await db
      .select()
      .from(dealerReviews)
      .where(eq(dealerReviews.dealerId, dealerId));
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db
      .update(dealers)
      .set({
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
        updatedAt: new Date(),
      })
      .where(eq(dealers.id, dealerId));

    res.status(201).json(review);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return void res.status(400).json({ error: "Invalid input" });
    }
    res.status(500).json({ error: "Failed to add review" });
  }
});

router.get("/dealers/:id/reviews", async (req, res) => {
  try {
    const dealerId = parseInt(req.params.id);
    const reviews = await db
      .select()
      .from(dealerReviews)
      .where(eq(dealerReviews.dealerId, dealerId))
      .orderBy(desc(dealerReviews.createdAt));
    res.json(reviews);
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

export default router;
