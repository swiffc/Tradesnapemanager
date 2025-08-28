import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const screenshots = pgTable("screenshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  imagePath: text("image_path").notNull(),
  tradeType: text("trade_type"), // Type 1, 2, 3
  bias: text("bias"), // M, A1, A2, W, V1, V2, ABS, 3XADR, L1_13_50, L2_50_200
  setupPattern: text("setup_pattern"), // EMA Respect, Symmetrical, Extended, etc.
  entry: text("entry"), // a, b, c variants
  studyBucket: text("study_bucket"), // BIAS, SETUPS, PATTERNS, ENTRYS
  strategyType: text("strategy_type"), // All 4 strategy levels + subcategories: SETUPS(BOX_SETUPS, ANCHORS, ASIAN_RANGE, HARMONICS_P1, RESET_SAFETY, RESETS), PATTERNS(1H_50_50_BOUNCE, 2ND_LEG_HALF_BAT, 3_DRIVES_3_DAY, 3_HITS_TRADE, HALF_BATS, HEAD_SHOULDERS, ID_50, LONDON_PATTERNS, TYPE1, TYPE2, TYPE3, TYPE4, W&M_PATTERNS), ENTRYS(RAILROAD_TRACKS, CORD_OF_WOODS, EVENING_STAR, MORNING_STAR, SHIFT_CANDLE)
  sessionTiming: text("session_timing"), // Asian, London, NY, Gap Times, Brinks
  currencyPair: text("currency_pair"),
  result: text("result"), // win, loss, breakeven
  riskReward: text("risk_reward"), // e.g., "+2.3R", "-0.5R"
  tags: text("tags").array().default([]),
  metadata: jsonb("metadata"), // Additional data like entry, stop, target
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  isBookmarked: boolean("is_bookmarked").default(false),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  screenshotId: varchar("screenshot_id").references(() => screenshots.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertScreenshotSchema = createInsertSchema(screenshots).omit({
  id: true,
  uploadedAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertScreenshot = z.infer<typeof insertScreenshotSchema>;
export type Screenshot = typeof screenshots.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;
