import "dotenv/config"; // Single dotenv import — must be FIRST
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import splitRouter from "./routes/splitRoute.js";
import favouriteRouter from "./routes/favouriteRoute.js";
import reviewRouter from "./routes/reviewRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

// Ensure uploads directory exists (required for Multer on fresh deploys)
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Validate required env vars early
const requiredEnv = ["MONGO_URL", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

// App config
const app = express();
const port = process.env.PORT || 4000;

// Normalize origin URLs (strip trailing slash) for reliable CORS matching
const normalizeOrigin = (url) => url?.replace(/\/$/, "");

const allowedOrigins = [
  "http://localhost:5173", // Frontend (dev)
  "http://localhost:5174", // Admin (dev)
  "http://localhost:5175", // Admin (dev alt port)
  normalizeOrigin(process.env.FRONTEND_URL),
  normalizeOrigin(process.env.ADMIN_URL),
].filter(Boolean);

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error(`CORS policy: origin ${origin} not allowed`), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
    credentials: true,
  })
);

// Health check — available before DB connects (Render uses this)
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "HabeshaBites API is running" });
});

// DB connection — connect before registering API routes
connectDB()
  .then(() => {
    app.use("/api/food", foodRouter);
    
    // Redirect requests for nested absolute URLs under /images/ (e.g. /images/https://res.cloudinary.com/...)
    app.use("/images", (req, res, next) => {
      const rawUrl = req.originalUrl || req.url;
      const match = rawUrl.match(/\/images\/(https?:\/?\/?.+)$/i);
      if (match) {
        let targetUrl = match[1];
        if (/^https?:\/[^\/]/i.test(targetUrl)) {
          targetUrl = targetUrl.replace(/^(https?:\/)/i, "$1/");
        }
        return res.redirect(301, targetUrl);
      }
      next();
    });

    app.use("/images", express.static(uploadsDir));
    app.use("/api/user", userRouter);
    app.use("/api/cart", cartRouter);
    app.use("/api/order", orderRouter);
    app.use("/api/split", splitRouter);
    app.use("/api/favourites", favouriteRouter);
    app.use("/api/reviews", reviewRouter);

    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server started on port: ${port}`);
      console.log(`📡 CORS allowed origins: ${allowedOrigins.join(", ")}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
