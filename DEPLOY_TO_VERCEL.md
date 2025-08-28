# 🚀 Deploy TradeSnapManager to Vercel

## Quick Deployment Steps

### 1. Login to Vercel
```bash
vercel login
```

### 2. Deploy the App
```bash
vercel --prod
```

### 3. Set Environment Variables in Vercel Dashboard
After deployment, go to your Vercel dashboard and add these environment variables:

```
DATABASE_URL=postgresql://postgres.dnfuclrknysvxtdgsjvf:Newday2433@044@aws-0-us-west-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://dnfuclrknysvxtdgsjvf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuZnVjbHJrbnlzdnh0ZGdzanZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzQyMDAsImV4cCI6MjA2OTQxMDIwMH0.SPhSIPldIpL1LtOQCPmRuurAzrOozfIHWZKFJkvL2ug
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuZnVjbHJrbnlzdnh0ZGdzanZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgzNDIwMCwiZXhwIjoyMDY5NDEwMjAwfQ.Ejsq8Hfu8Rgfw3aRRSbQ7eERL4DVTvmr_giUw2HyV0w
NODE_ENV=production
```

### 4. Redeploy After Adding Environment Variables
```bash
vercel --prod
```

## Alternative: GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Auto-deploy on every push!

## Your TradeSnapManager Features:
- ✅ Screenshot upload and organization
- ✅ Trade categorization by Bias → Setup → Pattern → Entry
- ✅ Notes and annotations
- ✅ Performance tracking
- ✅ Supabase database and storage
- ✅ Responsive design for mobile and desktop

## Troubleshooting:
- If API routes don't work, check that environment variables are set
- If database connection fails, verify DATABASE_URL is correct
- If file uploads fail, check Supabase storage bucket permissions
