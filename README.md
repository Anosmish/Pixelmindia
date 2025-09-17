# AI Image Generation Website

This is a full-stack MERN (MongoDB, Express, React, Node.js) application that allows users to generate and manipulate images using the Image Pig AI API.

## Features

- User registration and login (Email/Username & Password).
- JWT-based authentication for secure API routes.
- **Text-to-Image Generation**:
  - Default (Stable Diffusion 1.5)
  - XL (Stable Diffusion XL)
  - FLUX
- **Image Manipulation**:
  - Face Swapping
  - Background Removal (Cutout)
  - AI Upscaling
  - Outpainting

## Project Structure

```
/
├── backend/         # Express.js server
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env         # Environment variables
│   ├── package.json
│   └── server.js
└── frontend/        # React client
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── services/
    ├── package.json
    └── ...
```

## How to Run

1.  **Backend Setup**:
    - `cd backend`
    - `npm install`
    - `npm run server` (The server will start on port 5001)

2.  **Frontend Setup**:
    - `cd frontend`
    - `npm install`
    - `npm start` (The React app will start on port 3000 and proxy API requests to the backend)

3.  Open your browser and navigate to `http://localhost:3000`.