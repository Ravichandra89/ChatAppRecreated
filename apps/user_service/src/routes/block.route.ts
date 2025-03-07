import { Router } from "express";
import {
  BlockUser,
  unBlockUser,
  MuteUser,
  unmuteUser,
} from "../controllers/block.controller";

const blockRouter = Router();

// Definining Routes
blockRouter.post("/block", BlockUser);
blockRouter.post("/unblock", unBlockUser);
blockRouter.post("/mute", MuteUser);
blockRouter.post("/unmute", unmuteUser);

export default blockRouter;
