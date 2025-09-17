// // backend/server.js
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import userRoutes from "./routes/userRoutes.js";
// import imageRoutes from "./routes/imageRoutes.js";
// import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// dotenv.config();

// // Verify environment variables
// console.log("Environment check:");
// console.log("PORT:", process.env.PORT);
// console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "MISSING");
// console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "MISSING");
// console.log("IMAGEPIG_API_KEY:", process.env.IMAGEPIG_API_KEY ? "SET" : "MISSING");

// if (!process.env.IMAGEPIG_API_KEY) {
//   console.error("❌ CRITICAL: IMAGEPIG_API_KEY is missing from .env file");
//   console.error("Please add: IMAGEPIG_API_KEY=your_actual_api_key_here");
// }

// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));

// // Health check
// app.get("/", (req, res) => {
//   res.json({ 
//     status: "OK", 
//     message: "API is running",
//     hasApiKey: !!process.env.IMAGEPIG_API_KEY
//   });
// });

// // Routes
// app.use("/api/users", userRoutes);
// app.use("/api/images", imageRoutes);

// // Error middleware
// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT || 5001;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📝 API Key status: ${process.env.IMAGEPIG_API_KEY ? "CONFIGURED" : "MISSING"}`);
// });
// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Load environment variables FIRST
dotenv.config();

// Verify environment variables
console.log("Environment check:");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "MISSING");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "MISSING");
console.log("IMAGEPIG_API_KEY:", process.env.IMAGEPIG_API_KEY ? "SET" : "MISSING");

// Debug: Check the actual value (masked for security)
if (process.env.IMAGEPIG_API_KEY) {
  console.log("API Key length:", process.env.IMAGEPIG_API_KEY.length);
  console.log("API Key starts with:", process.env.IMAGEPIG_API_KEY.substring(0, 8) + "...");
} else {
  console.error("❌ CRITICAL: IMAGEPIG_API_KEY is missing from .env file");
  console.error("Please add: IMAGEPIG_API_KEY=your_actual_api_key_here");
  process.exit(1);
}

// Fix MongoDB URI if it has the typo
if (process.env.MONGO_URI && process.env.MONGO_URI.includes('retrywrades')) {
  console.log("🔄 Fixing MongoDB URI typo...");
  process.env.MONGO_URI = process.env.MONGO_URI.replace('retrywrades', 'retryWrites');
}

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "API is running",
    hasApiKey: !!process.env.IMAGEPIG_API_KEY,
    apiKeyLength: process.env.IMAGEPIG_API_KEY ? process.env.IMAGEPIG_API_KEY.length : 0
  });
});

// Test route to check API key
app.get("/api/test-api-key", (req, res) => {
  res.json({
    apiKeyPresent: !!process.env.IMAGEPIG_API_KEY,
    apiKeyLength: process.env.IMAGEPIG_API_KEY ? process.env.IMAGEPIG_API_KEY.length : 0,
    apiKeyStartsWith: process.env.IMAGEPIG_API_KEY ? process.env.IMAGEPIG_API_KEY.substring(0, 8) + "..." : "N/A"
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);

// Error middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Key status: ${process.env.IMAGEPIG_API_KEY ? "CONFIGURED" : "MISSING"}`);
  if (process.env.IMAGEPIG_API_KEY) {
    console.log(`🔑 API Key: ${process.env.IMAGEPIG_API_KEY.substring(0, 8)}...`);
  }
});