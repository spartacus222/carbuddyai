import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai";
import vehiclesRouter from "./vehicles";
import shortlistRouter from "./shortlist";
import agentRouter from "./agent";
import dealersRouter from "./dealers";
import vehicleListingsRouter from "./vehicle-listings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(openaiRouter);
router.use(vehiclesRouter);
router.use(shortlistRouter);
router.use(agentRouter);
router.use(dealersRouter);
router.use(vehicleListingsRouter);

export default router;
