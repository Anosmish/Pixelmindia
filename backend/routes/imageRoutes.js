import express from "express";
import * as imageController from "../controllers/imageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Image generation
router.post("/generate-default", protect, imageController.generateDefault);
router.post("/generate-xl", protect, imageController.generateXl);
router.post("/generate-flux", protect, imageController.generateFlux);

// Editing features
router.post("/faceswap", protect, imageController.faceSwap);
router.post("/cutout", protect, imageController.cutout);
router.post("/upscale", protect, imageController.upscale);
router.post("/outpaint", protect, imageController.outpaint);

export default router;
