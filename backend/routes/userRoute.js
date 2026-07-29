import express from "express";
import {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";
import multer from "multer";

const userRouter = express.Router();

// Multer configurations for profile picture upload
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.post(
  "/profile/update",
  upload.single("profilePicture"),
  authMiddleware,
  updateProfile
);

export default userRouter;
