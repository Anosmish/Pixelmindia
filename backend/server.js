// backend/server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// -------------------- Load Environment Variables --------------------
dotenv.config();

// -------------------- Environment Verification --------------------
console.log("Environment check:");
console.log("PORT:", process.env.PORT || "5001");
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "MISSING");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "MISSING");
console.log("IMAGEPIG_API_KEY:", process.env.IMAGEPIG_API_KEY ? "SET" : "MISSING");

// Fail fast if critical env missing
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("❌ Missing required environment variables (MONGO_URI/JWT_SECRET)");
  process.exit(1);
}

// Debug IMAGEPIG_API_KEY (masked)
if (process.env.IMAGEPIG_API_KEY) {
  console.log("API Key length:", process.env.IMAGEPIG_API_KEY.length);
  console.log("API Key starts with:", process.env.IMAGEPIG_API_KEY.substring(0, 8) + "...");
} else {
  console.error("❌ CRITICAL: IMAGEPIG_API_KEY is missing from .env file");
  process.exit(1);
}

// Fix MongoDB URI typo if exists
if (process.env.MONGO_URI.includes("retrywrades")) {
  console.log("🔄 Fixing MongoDB URI typo...");
  process.env.MONGO_URI = process.env.MONGO_URI.replace("retrywrades", "retryWrites");
}

// -------------------- Database Connection --------------------
connectDB();

// -------------------- Express App Setup --------------------
const app = express();

// -------------------- Middlewares --------------------
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // Recommended: set frontend domain in Render ENV
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// -------------------- Health Check --------------------
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "API is running",
    hasApiKey: !!process.env.IMAGEPIG_API_KEY,
    apiKeyLength: process.env.IMAGEPIG_API_KEY ? process.env.IMAGEPIG_API_KEY.length : 0,
  });
});

// -------------------- Test API Key Endpoint --------------------
app.get("/api/test-api-key", (req, res) => {
  res.json({
    apiKeyPresent: !!process.env.IMAGEPIG_API_KEY,
    apiKeyLength: process.env.IMAGEPIG_API_KEY ? process.env.IMAGEPIG_API_KEY.length : 0,
    apiKeyStartsWith: process.env.IMAGEPIG_API_KEY
      ? process.env.IMAGEPIG_API_KEY.substring(0, 8) + "..."
      : "N/A",
  });
});

// -------------------- Routes --------------------
app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);

// -------------------- Error Handling --------------------
app.use(notFound);
app.use(errorHandler);

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📝 IMAGEPIG_API_KEY status: ${process.env.IMAGEPIG_API_KEY ? "CONFIGURED" : "MISSING"}`
  );
  if (process.env.IMAGEPIG_API_KEY) {
    console.log(`🔑 API Key: ${process.env.IMAGEPIG_API_KEY.substring(0, 8)}...`);
  }
});
