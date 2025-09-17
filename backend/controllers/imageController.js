// backend/controllers/imageController.js
import axios from "axios";
import asyncHandler from "express-async-handler";

const IMAGEPIG_API = "https://api.imagepig.com";

// Function to get API key with proper validation
const getApiKey = () => {
  const apiKey = process.env.IMAGEPIG_API_KEY;
  
  if (!apiKey) {
    console.error("❌ CRITICAL: IMAGEPIG_API_KEY is missing from environment variables");
    throw new Error("API service is temporarily unavailable. Please contact administrator.");
  }
  
  if (apiKey.trim().length !== 36) {
    console.error("❌ API key format invalid. Expected 36 characters, got:", apiKey.length);
    throw new Error("API configuration error. Please contact administrator.");
  }
  
  return apiKey.trim();
};

const callImagePig = async (endpoint, payload) => {
  const API_KEY = getApiKey();

  try {
    const config = {
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    };

    console.log(`📤 Sending to ${endpoint} with key: ${API_KEY.substring(0, 8)}...`);

    const { data } = await axios.post(
      `${IMAGEPIG_API}${endpoint}`,
      payload,
      config
    );
    
    console.log(`✅ Success from ${endpoint}`);
    return data;
  } catch (err) {
    console.error(`❌ ImagePig API Error for ${endpoint}:`, {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message
    });
    
    // Provide user-friendly error messages
    let errorMessage = "Failed to process image request. Please try again.";
    
    if (err.response?.status === 401 || err.response?.status === 403) {
      errorMessage = "Authentication failed. Please check your API configuration.";
    } else if (err.response?.status === 422) {
      if (err.response?.data?.detail) {
        // Parse Pydantic validation errors
        const details = err.response.data.detail;
        if (Array.isArray(details)) {
          errorMessage = details.map(d => d.msg || "Validation error").join(", ");
        } else {
          errorMessage = "Invalid request parameters. Please check your input.";
        }
      } else {
        errorMessage = "Invalid request format. Please check your input parameters.";
      }
    } else if (err.response?.status === 429) {
      errorMessage = "Rate limit exceeded. Please try again later.";
    } else if (err.code === 'ECONNABORTED') {
      errorMessage = "Request timeout. The server is taking too long to respond.";
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else if (!err.response) {
      errorMessage = "Network error. Please check your internet connection.";
    }
    
    throw new Error(errorMessage);
  }
};

// === CONTROLLERS ===

// Default (SD1.5, 512x512)
export const generateDefault = asyncHandler(async (req, res) => {
  const { prompt, negative_prompt, language, format, seed, storage_days } = req.body;
  
  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ 
      error: "Prompt is required",
      message: "Please provide a description of what you want to generate."
    });
  }
  
  const payload = { 
    prompt: prompt.trim(),
    negative_prompt: negative_prompt?.trim() || "",
    language: language?.trim() || "en",
    format: format?.trim() || "JPEG",
    seed: seed ? parseInt(seed) : Math.floor(Math.random() * 1000000),
    storage_days: storage_days || 0
  };
  
  try {
    const data = await callImagePig("/", payload);
    res.json(data);
  } catch (error) {
    res.status(422).json({ 
      error: error.message,
      message: "Failed to generate image. Please try a different prompt."
    });
  }
});

// XL (SDXL, 1024x1024)
export const generateXl = asyncHandler(async (req, res) => {
  const { prompt, negative_prompt, language, format, seed, storage_days } = req.body;
  
  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ 
      error: "Prompt is required",
      message: "Please provide a description of what you want to generate."
    });
  }
  
  const payload = { 
    prompt: prompt.trim(),
    negative_prompt: negative_prompt?.trim() || "",
    language: language?.trim() || "en",
    format: format?.trim() || "JPEG",
    seed: seed ? parseInt(seed) : Math.floor(Math.random() * 1000000),
    storage_days: storage_days || 0
  };
  
  try {
    const data = await callImagePig("/xl", payload);
    res.json(data);
  } catch (error) {
    res.status(422).json({ 
      error: error.message,
      message: "Failed to generate XL image. Please try a different prompt."
    });
  }
});

// FLUX
export const generateFlux = asyncHandler(async (req, res) => {
  const { prompt, proportion, language, format, seed, storage_days } = req.body;
  
  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ 
      error: "Prompt is required",
      message: "Please provide a description of what you want to generate."
    });
  }
  
  const payload = { 
    prompt: prompt.trim(),
    proportion: proportion?.trim() || "landscape",
    language: language?.trim() || "en",
    format: format?.trim() || "JPEG",
    seed: seed ? parseInt(seed) : Math.floor(Math.random() * 1000000),
    storage_days: storage_days || 0
  };
  
  try {
    const data = await callImagePig("/flux", payload);
    res.json(data);
  } catch (error) {
    res.status(422).json({ 
      error: error.message,
      message: "Failed to generate FLUX image. Please try a different prompt."
    });
  }
});

// FaceSwap
export const faceSwap = asyncHandler(async (req, res) => {
  const { source_image_data, source_image_url, target_image_data, target_image_url, format, storage_days } = req.body;
  
  if (!source_image_data && !source_image_url) {
    return res.status(400).json({ 
      error: "Source image is required",
      message: "Please provide either source_image_data or source_image_url."
    });
  }
  
  if (!target_image_data && !target_image_url) {
    return res.status(400).json({ 
      error: "Target image is required",
      message: "Please provide either target_image_data or target_image_url."
    });
  }
  
  const payload = { 
    source_image_data: source_image_data?.trim() || undefined,
    source_image_url: source_image_url?.trim() || undefined,
    target_image_data: target_image_data?.trim() || undefined,
    target_image_url: target_image_url?.trim() || undefined,
    format: format?.trim() || "JPEG",
    storage_days: storage_days || 0
  };
  
  // Remove undefined values
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
  
  try {
    const data = await callImagePig("/faceswap", payload);
    res.json(data);
  } catch (error) {
    res.status(422).json({ 
      error: error.message,
      message: "Failed to perform face swap. Please check your images and try again."
    });
  }
});

// Cutout (background removal)
export const cutout = asyncHandler(async (req, res) => {
  const { image_data, image_url, seed, storage_days } = req.body;
  
  if (!image_data && !image_url) {
    return res.status(400).json({ 
      error: "Image is required",
      message: "Please provide either image_data or image_url."
    });
  }
  
  const payload = { 
    image_data: image_data?.trim() || undefined,
    image_url: image_url?.trim() || undefined,
    seed: seed ? parseInt(seed) : Math.floor(Math.random() * 1000000),
    storage_days: storage_days || 0
  };
  
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
  
  try {
    const data = await callImagePig("/cutout", payload);
    res.json(data);
  } catch (error) {
    res.status(422).json({ 
      error: error.message,
      message: "Failed to remove background. Please check your image and try again."
    });
  }
});

// Upscale
export const upscale = asyncHandler(async (req, res) => {
  const { image_data, image_url, upscaling_factor, format, seed, storage_days } = req.body;
  
  if (!image_data && !image_url) {
    return res.status(400).json({ 
      error: "Image is required",
      message: "Please provide either image_data or image_url."
    });
  }
  
  const payload = { 
    image_data: image_data?.trim() || undefined,
    image_url: image_url?.trim() || undefined,
    upscaling_factor: upscaling_factor || 2,
    format: format?.trim() || "JPEG",
    seed: seed ? parseInt(seed) : Math.floor(Math.random() * 1000000),
    storage_days: storage_days || 0
  };
  
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
  
  try {
    const data = await callImagePig("/upscale", payload);
    res.json(data);
  } catch (error) {
    res.status(422).json({ 
      error: error.message,
      message: "Failed to upscale image. Please check your image and try again."
    });
  }
});

// Outpaint
export const outpaint = asyncHandler(async (req, res) => {
  const { image_data, image_url, prompt, negative_prompt, language, top, right, bottom, left, format, seed, storage_days } = req.body;
  
  if (!image_data && !image_url) {
    return res.status(400).json({ 
      error: "Image is required",
      message: "Please provide either image_data or image_url."
    });
  }
  
  const payload = { 
    image_data: image_data?.trim() || undefined,
    image_url: image_url?.trim() || undefined,
    prompt: prompt?.trim() || "",
    negative_prompt: negative_prompt?.trim() || "",
    language: language?.trim() || "en",
    top: top || 0,
    right: right || 0,
    bottom: bottom || 0,
    left: left || 0,
    format: format?.trim() || "JPEG",
    seed: seed ? parseInt(seed) : Math.floor(Math.random() * 1000000),
    storage_days: storage_days || 0
  };
  
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
  
  try {
    const data = await callImagePig("/outpaint", payload);
    res.json(data);
  } catch (error) {
    res.status(422).json({ 
      error: error.message,
      message: "Failed to outpaint image. Please check your image and prompt, then try again."
    });
  }
});

// Health check endpoint for images
export const checkImageApiHealth = asyncHandler(async (req, res) => {
  try {
    const API_KEY = getApiKey();
    res.json({
      status: "healthy",
      apiKeyConfigured: true,
      apiKeyLength: API_KEY.length,
      apiKeyPrefix: API_KEY.substring(0, 8) + "...",
      message: "Image API is ready"
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      apiKeyConfigured: false,
      error: error.message,
      message: "Image API is not configured properly"
    });
  }
});