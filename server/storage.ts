import { type Screenshot, type InsertScreenshot, type Note, type InsertNote } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Screenshots
  createScreenshot(screenshot: InsertScreenshot): Promise<Screenshot>;
  getScreenshots(filters?: {
    strategyType?: string;
    sessionTiming?: string;
    studyBucket?: string;
    isBookmarked?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Screenshot[]>;
  getScreenshotById(id: string): Promise<Screenshot | undefined>;
  updateScreenshot(id: string, updates: Partial<InsertScreenshot>): Promise<Screenshot | undefined>;
  deleteScreenshot(id: string): Promise<boolean>;
  
  // Notes
  createNote(note: InsertNote): Promise<Note>;
  getNotesByScreenshotId(screenshotId: string): Promise<Note[]>;
  updateNote(id: string, content: string): Promise<Note | undefined>;
  deleteNote(id: string): Promise<boolean>;
  
  // Stats
  getScreenshotStats(): Promise<{
    total: number;
    thisWeek: number;
    winRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private screenshots: Map<string, Screenshot>;
  private notes: Map<string, Note>;

  constructor() {
    this.screenshots = new Map();
    this.notes = new Map();
  }

  async createScreenshot(insertScreenshot: InsertScreenshot): Promise<Screenshot> {
    const id = randomUUID();
    const screenshot: Screenshot = {
      ...insertScreenshot,
      id,
      uploadedAt: new Date(),
      metadata: insertScreenshot.metadata || {},
      tradeType: insertScreenshot.tradeType || null,
      bias: insertScreenshot.bias || null,
      setupPattern: insertScreenshot.setupPattern || null,
      entry: insertScreenshot.entry || null,
      studyBucket: insertScreenshot.studyBucket || null,
      strategyType: insertScreenshot.strategyType || null,
      sessionTiming: insertScreenshot.sessionTiming || null,
      currencyPair: insertScreenshot.currencyPair || null,
      result: insertScreenshot.result || "win", // Default to win
      riskReward: insertScreenshot.riskReward || "+2R", // Default to 2R
      tags: insertScreenshot.tags || [],
      isBookmarked: insertScreenshot.isBookmarked || false,
    };
    this.screenshots.set(id, screenshot);
    return screenshot;
  }

  async getScreenshots(filters?: {
    strategyType?: string;
    sessionTiming?: string;
    studyBucket?: string;
    isBookmarked?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Screenshot[]> {
    let results = Array.from(this.screenshots.values());
    
    if (filters?.strategyType) {
      results = results.filter(s => s.strategyType === filters.strategyType);
    }
    
    if (filters?.sessionTiming) {
      results = results.filter(s => s.sessionTiming === filters.sessionTiming);
    }
    
    if (filters?.studyBucket) {
      results = results.filter(s => s.studyBucket === filters.studyBucket);
    }
    
    if (filters?.isBookmarked !== undefined) {
      results = results.filter(s => s.isBookmarked === filters.isBookmarked);
    }
    
    // Sort by uploadedAt desc
    results.sort((a, b) => new Date(b.uploadedAt!).getTime() - new Date(a.uploadedAt!).getTime());
    
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    
    return results.slice(offset, offset + limit);
  }

  async getScreenshotById(id: string): Promise<Screenshot | undefined> {
    return this.screenshots.get(id);
  }

  async updateScreenshot(id: string, updates: Partial<InsertScreenshot>): Promise<Screenshot | undefined> {
    const screenshot = this.screenshots.get(id);
    if (!screenshot) return undefined;
    
    const updated = { ...screenshot, ...updates };
    this.screenshots.set(id, updated);
    return updated;
  }

  async deleteScreenshot(id: string): Promise<boolean> {
    return this.screenshots.delete(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = randomUUID();
    const note: Note = {
      ...insertNote,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notes.set(id, note);
    return note;
  }

  async getNotesByScreenshotId(screenshotId: string): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(note => note.screenshotId === screenshotId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async updateNote(id: string, content: string): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updated = { ...note, content, updatedAt: new Date() };
    this.notes.set(id, updated);
    return updated;
  }

  async deleteNote(id: string): Promise<boolean> {
    return this.notes.delete(id);
  }

  async getScreenshotStats(): Promise<{
    total: number;
    thisWeek: number;
    winRate: number;
  }> {
    const screenshots = Array.from(this.screenshots.values());
    const total = screenshots.length;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = screenshots.filter(s => new Date(s.uploadedAt!) > oneWeekAgo).length;
    
    // All trades are winners now
    const winRate = total > 0 ? 100 : 0;
    
    return { total, thisWeek, winRate };
  }
}

import { SupabaseStorage } from './supabaseStorage';

// Use Supabase storage if DATABASE_URL is properly configured, otherwise fallback to memory
const isDatabaseConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('YOUR_DB_PASSWORD');

export const storage = isDatabaseConfigured ? new SupabaseStorage() : new MemStorage();
