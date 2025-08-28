import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Create Express app for Vercel
const app = express();

// Increase payload size limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Add logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Initialize routes
let routesInitialized = false;

async function initializeRoutes() {
  if (!routesInitialized) {
    await registerRoutes(app);
    routesInitialized = true;
  }
}

// Vercel handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initializeRoutes();
  
  // Convert Vercel request to Express request format
  const expressReq = req as any;
  const expressRes = res as any;
  
  // Handle the request with Express
  app(expressReq, expressRes);
}
