import { eq, desc, and, sql } from 'drizzle-orm';
import { db } from './database';
import { screenshots, notes, users } from '@shared/schema';
import { type Screenshot, type InsertScreenshot, type Note, type InsertNote } from "@shared/schema";
import { IStorage } from './storage';

export class SupabaseStorage implements IStorage {
  
  async createScreenshot(insertScreenshot: InsertScreenshot): Promise<Screenshot> {
    const [screenshot] = await db.insert(screenshots).values(insertScreenshot).returning();
    return screenshot;
  }

  async getScreenshots(filters?: {
    strategyType?: string;
    sessionTiming?: string;
    isBookmarked?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Screenshot[]> {
    let query = db.select().from(screenshots);
    
    const conditions = [];
    
    if (filters?.strategyType) {
      conditions.push(eq(screenshots.strategyType, filters.strategyType));
    }
    
    if (filters?.sessionTiming) {
      conditions.push(eq(screenshots.sessionTiming, filters.sessionTiming));
    }
    
    if (filters?.isBookmarked !== undefined) {
      conditions.push(eq(screenshots.isBookmarked, filters.isBookmarked));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Order by uploadedAt desc
    query = query.orderBy(desc(screenshots.uploadedAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  async getScreenshotById(id: string): Promise<Screenshot | undefined> {
    const [screenshot] = await db.select().from(screenshots).where(eq(screenshots.id, id));
    return screenshot;
  }

  async updateScreenshot(id: string, updates: Partial<InsertScreenshot>): Promise<Screenshot | undefined> {
    const [screenshot] = await db.update(screenshots)
      .set(updates)
      .where(eq(screenshots.id, id))
      .returning();
    return screenshot;
  }

  async deleteScreenshot(id: string): Promise<boolean> {
    const result = await db.delete(screenshots).where(eq(screenshots.id, id));
    return result.length > 0;
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db.insert(notes).values({
      ...insertNote,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return note;
  }

  async getNotesByScreenshotId(screenshotId: string): Promise<Note[]> {
    return await db.select().from(notes)
      .where(eq(notes.screenshotId, screenshotId))
      .orderBy(notes.createdAt);
  }

  async updateNote(id: string, content: string): Promise<Note | undefined> {
    const [note] = await db.update(notes)
      .set({ content, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
    return note;
  }

  async deleteNote(id: string): Promise<boolean> {
    const result = await db.delete(notes).where(eq(notes.id, id));
    return result.length > 0;
  }

  async getScreenshotStats(): Promise<{
    total: number;
    thisWeek: number;
    winRate: number;
  }> {
    // Get total count
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(screenshots);
    const total = totalResult[0]?.count || 0;
    
    // Get this week's count
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekResult = await db.select({ count: sql<number>`count(*)` })
      .from(screenshots)
      .where(sql`${screenshots.uploadedAt} > ${oneWeekAgo}`);
    const thisWeek = thisWeekResult[0]?.count || 0;
    
    // Calculate win rate (count wins vs total)
    const winResult = await db.select({ count: sql<number>`count(*)` })
      .from(screenshots)
      .where(eq(screenshots.result, 'win'));
    const wins = winResult[0]?.count || 0;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    
    return { total, thisWeek, winRate };
  }
}