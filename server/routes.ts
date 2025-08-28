import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScreenshotSchema, insertNoteSchema } from "@shared/schema";
import { supabase } from "./supabase";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Screenshots API
  app.get("/api/screenshots", async (req, res) => {
    try {
      const { strategyType, sessionTiming, studyBucket, isBookmarked, limit, offset } = req.query;
      const screenshots = await storage.getScreenshots({
        strategyType: strategyType as string,
        sessionTiming: sessionTiming as string,
        studyBucket: studyBucket as string,
        isBookmarked: isBookmarked === 'true' ? true : isBookmarked === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(screenshots);
    } catch (error) {
      console.error("Error fetching screenshots:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/screenshots", async (req, res) => {
    try {
      const screenshotData = insertScreenshotSchema.parse(req.body);
      const screenshot = await storage.createScreenshot(screenshotData);
      res.status(201).json(screenshot);
    } catch (error) {
      console.error("Error creating screenshot:", error);
      res.status(400).json({ error: "Invalid screenshot data" });
    }
  });

  app.get("/api/screenshots/:id", async (req, res) => {
    try {
      const screenshot = await storage.getScreenshotById(req.params.id);
      if (!screenshot) {
        return res.status(404).json({ error: "Screenshot not found" });
      }
      res.json(screenshot);
    } catch (error) {
      console.error("Error fetching screenshot:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/screenshots/:id", async (req, res) => {
    try {
      const updates = insertScreenshotSchema.partial().parse(req.body);
      const screenshot = await storage.updateScreenshot(req.params.id, updates);
      if (!screenshot) {
        return res.status(404).json({ error: "Screenshot not found" });
      }
      res.json(screenshot);
    } catch (error) {
      console.error("Error updating screenshot:", error);
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/screenshots/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteScreenshot(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Screenshot not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting screenshot:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Notes API
  app.get("/api/screenshots/:screenshotId/notes", async (req, res) => {
    try {
      const notes = await storage.getNotesByScreenshotId(req.params.screenshotId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/screenshots/:screenshotId/notes", async (req, res) => {
    try {
      const noteData = insertNoteSchema.parse({
        ...req.body,
        screenshotId: req.params.screenshotId,
      });
      const note = await storage.createNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const { content } = req.body;
      if (typeof content !== 'string') {
        return res.status(400).json({ error: "Content is required" });
      }
      const note = await storage.updateNote(req.params.id, content);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Stats API
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getScreenshotStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
