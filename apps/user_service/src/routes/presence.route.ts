import { Router } from "express";
import { getUserPresence } from "../controllers/presence.controller";

const presenceRouter = Router();

// Define here routes
presenceRouter.get("/:userId", getUserPresence);

export default presenceRouter;
