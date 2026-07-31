import express from "express";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";



const foodRouter = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "HabeshaBites",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

foodRouter.post("/add",upload.single("image"),authMiddleware,addFood);
foodRouter.get("/list",listFood);
foodRouter.post("/remove",authMiddleware,removeFood);

export default foodRouter;
