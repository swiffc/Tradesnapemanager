import { Router } from "express";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  try {
    // Basic health check
    const healthData = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || "development"
    };

    res.status(200).json(healthData);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed system status
router.get("/status", (req, res) => {
  try {
    const status = {
      server: "online",
      database: process.env.DATABASE_URL ? "connected" : "fallback",
      api: "responsive",
      features: "operational",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "2.0.0"
    };

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({
      server: "error",
      database: "error",
      api: "error",
      features: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
