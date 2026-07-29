import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  getFavourites,
  addFavourite,
  removeFavourite,
} from "../controllers/favouriteController.js";

const favouriteRouter = express.Router();

favouriteRouter.get("/", authMiddleware, getFavourites);
favouriteRouter.post("/add", authMiddleware, addFavourite);
favouriteRouter.delete("/remove/:id", authMiddleware, removeFavourite);

export default favouriteRouter;
