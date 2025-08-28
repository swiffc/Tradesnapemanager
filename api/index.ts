import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertScreenshotSchema, insertNoteSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;
  const path = url?.replace('/api', '') || '/';

  try {
    // Health check endpoint
    if (path === '/health') {
      return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Screenshots API
    if (path === '/screenshots') {
      if (req.method === 'GET') {
        const { strategyType, sessionTiming, studyBucket, isBookmarked, limit, offset } = req.query;
        const screenshots = await storage.getScreenshots({
          strategyType: strategyType as string,
          sessionTiming: sessionTiming as string,
          studyBucket: studyBucket as string,
          isBookmarked: isBookmarked === 'true' ? true : isBookmarked === 'false' ? false : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
          offset: offset ? parseInt(offset as string) : undefined,
        });
        return res.json(screenshots);
      }

      if (req.method === 'POST') {
        const screenshotData = insertScreenshotSchema.parse(req.body);
        const screenshot = await storage.createScreenshot(screenshotData);
        return res.status(201).json(screenshot);
      }
    }

    // Stats API
    if (path === '/stats') {
      if (req.method === 'GET') {
        const stats = await storage.getScreenshotStats();
        return res.json(stats);
      }
    }

    // Default 404
    return res.status(404).json({ error: 'API endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
