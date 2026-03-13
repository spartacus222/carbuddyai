import { Router, type IRouter } from "express";
import { runDealerAgent } from "../agent/dealer-agent";
import { z } from "zod";

const router: IRouter = Router();

const DealerSearchInput = z.object({
  location: z.string().min(2),
  vehicleQuery: z.string().min(2),
  maxDealers: z.number().int().min(1).max(5).optional().default(3),
});

router.post("/agent/dealer-search", async (req, res) => {
  try {
    const input = DealerSearchInput.parse(req.body);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    req.on("close", () => {
      console.log("[agent] Client disconnected");
    });

    await runDealerAgent(input, res);
    res.end();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return void res.status(400).json({ error: "Invalid input", details: err.errors });
    }
    console.error("[agent] Unexpected error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Agent failed" });
    }
  }
});

export default router;
