import express from "express";
import { createSplit, getShare, payShare, getSplitProgress } from "../controllers/splitController.js";

const splitRouter = express.Router();

splitRouter.post("/create", createSplit);
splitRouter.get("/order/:orderId", getSplitProgress);
splitRouter.get("/share/:token", getShare);
splitRouter.get("/:token", getShare);
splitRouter.put("/:token/pay", payShare);


export default splitRouter;