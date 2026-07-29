import express from "express";
import authMiddleware from "../middleware/auth.js";
import { addReview, getReviews } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.get("/:foodId", getReviews);
reviewRouter.post("/add", authMiddleware, addReview);

export default reviewRouter;
