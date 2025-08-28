# 📊 TradeSnapManager

> **A comprehensive trading screenshot management system for systematic trade analysis and performance tracking**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/swiffc/Tradesnapemanager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

## 🎯 Overview

TradeSnapManager is a full-stack web application designed for traders who want to systematically organize, analyze, and learn from their trading screenshots. Built with a focus on the **Bias → Setup → Pattern → Entry** methodology, it provides a comprehensive platform for trade documentation and performance analysis.

### ✨ Key Features

- 📸 **Screenshot Management**: Upload, organize, and categorize trading screenshots
- 🎯 **Systematic Organization**: Hierarchical categorization by Bias → Setup → Pattern → Entry
- 📊 **Performance Analytics**: Track win rates, risk-reward ratios, and trading statistics
- 🕒 **Session Analysis**: Compare performance across Asian, London, and NY sessions
- 📝 **Notes & Annotations**: Add detailed analysis and insights to each trade
- 🔖 **Bookmarking System**: Mark important trades for quick reference
- 📱 **Responsive Design**: Access your trades from desktop, tablet, or mobile
- ☁️ **Cloud Storage**: Secure file storage with Supabase integration

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations
- **React Hook Form** with Zod validation
- **TanStack Query** for data fetching

**Backend:**
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **PostgreSQL** (Supabase) for data storage
- **Supabase Storage** for file management

**Deployment:**
- **Vercel** for hosting and serverless functions
- **GitHub** for version control
- **Supabase** for database and storage

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/swiffc/Tradesnapemanager.git
   cd Tradesnapemanager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   DATABASE_URL=your_supabase_database_url
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NODE_ENV=development
   PORT=5000
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 📊 Trading Methodology

TradeSnapManager is built around a systematic trading approach:

### 🎯 Bias Categories
- **M** (Monthly)
- **A1, A2** (Advanced levels)
- **W** (Weekly)
- **V1, V2** (Volume levels)
- **ABS** (Absolute)
- **3XADR** (3x Average Daily Range)
- **L1_13_50, L2_50_200** (Liquidity levels)

### 🔧 Setup Patterns
- EMA Respect
- Symmetrical
- Extended
- Box Setups
- Anchors
- Asian Range
- Harmonics P1
- Reset Safety
- Resets

### 📈 Entry Types
- **a, b, c variants** for precise entry timing
- Railroad Tracks
- Cord of Woods
- Evening Star
- Morning Star
- Shift Candle

### 📊 Performance Metrics
- Win/Loss ratios by strategy
- Risk-Reward analysis (R-multiples)
- Session performance comparison
- Drawdown tracking
- Consecutive wins/losses

## 🗄️ Database Schema

### Screenshots Table
```sql
- id: UUID (Primary Key)
- title: Text
- imagePath: Text
- tradeType: Text (Type 1, 2, 3)
- bias: Text (M, A1, A2, W, V1, V2, ABS, 3XADR, L1_13_50, L2_50_200)
- setupPattern: Text
- entry: Text (a, b, c variants)
- studyBucket: Text (BIAS, SETUPS, PATTERNS, ENTRYS)
- strategyType: Text
- sessionTiming: Text (Asian, London, NY, Gap Times, Brinks)
- currencyPair: Text
- result: Text (win, loss, breakeven)
- riskReward: Text (e.g., "+2.3R", "-0.5R")
- tags: Text Array
- metadata: JSONB (Additional trade data)
- uploadedAt: Timestamp
- isBookmarked: Boolean
```

### Notes Table
```sql
- id: UUID (Primary Key)
- screenshotId: UUID (Foreign Key)
- content: Text
- createdAt: Timestamp
- updatedAt: Timestamp
```

## 🔌 API Endpoints

### Screenshots
- `GET /api/screenshots` - List screenshots with filtering
- `POST /api/screenshots` - Upload new screenshot
- `GET /api/screenshots/:id` - Get specific screenshot
- `PUT /api/screenshots/:id` - Update screenshot
- `DELETE /api/screenshots/:id` - Delete screenshot

### Notes
- `GET /api/screenshots/:screenshotId/notes` - Get notes for screenshot
- `POST /api/screenshots/:screenshotId/notes` - Add note to screenshot
- `PUT /api/notes/:id` - Update note

### Analytics
- `GET /api/stats` - Get trading statistics and performance metrics

### Health Check
- `GET /api/health` - API health status

## 🚀 Deployment

### Deploy to Vercel

1. **Fork this repository**

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your forked repository

3. **Configure Environment Variables**
   Add these in your Vercel project settings:
   ```
   DATABASE_URL=your_supabase_database_url
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NODE_ENV=production
   ```

4. **Deploy**
   Vercel will automatically build and deploy your application

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy using Vercel CLI
npm install -g vercel
vercel --prod
```

## 🛠️ Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Express.js backend
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── database.ts         # Database connection
│   └── supabase.ts         # Supabase configuration
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
├── api/                    # Vercel serverless functions
└── migrations/             # Database migrations
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # Type check with TypeScript
npm run db:push      # Push database schema changes
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Usage Examples

### Upload a Trading Screenshot
1. Click "Upload Screenshot"
2. Select your trading screenshot
3. Fill in the trade details:
   - Bias type (M, A1, A2, etc.)
   - Setup pattern (EMA Respect, Symmetrical, etc.)
   - Entry type (a, b, c variants)
   - Session timing (Asian, London, NY)
   - Currency pair
   - Result (win/loss/breakeven)
   - Risk-reward ratio

### Organize Your Trades
- Use the hierarchical filtering system
- Filter by bias → setup → pattern → entry
- Search by currency pair or date range
- Bookmark important trades for quick access

### Analyze Performance
- View win rates by strategy type
- Compare session performance
- Track risk-reward ratios
- Analyze consecutive wins/losses

## 🔧 Configuration

### Supabase Setup

1. **Create a Supabase project**
2. **Set up the database** using the provided schema
3. **Configure storage bucket** for screenshot uploads
4. **Set up Row Level Security (RLS)** policies if needed

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `NODE_ENV` | Environment (development/production) | ✅ |
| `PORT` | Server port (default: 5000) | ❌ |

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify your `DATABASE_URL` is correct
- Check if your IP is whitelisted in Supabase
- Ensure the database is accessible

**File Upload Issues**
- Check Supabase storage bucket permissions
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Ensure file size limits are appropriate

**Build Failures**
- Check all environment variables are set
- Verify TypeScript compilation passes
- Ensure all dependencies are installed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- 📧 **Email**: [Your Email]
- 🐛 **Issues**: [GitHub Issues](https://github.com/swiffc/Tradesnapemanager/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/swiffc/Tradesnapemanager/discussions)

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://typescriptlang.org/)
- Database powered by [Supabase](https://supabase.com/)
- Hosted on [Vercel](https://vercel.com/)
- UI components from [Radix UI](https://radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Happy Trading! 📈**

*TradeSnapManager - Organize your trades, analyze your performance, improve your results.*
