# QuestBound - Habit RPG 🎮⚔️

A gamified habit tracking app that turns your daily routines into epic quests. Built with React + TypeScript and powered by Supabase for cloud sync.

## Features

- 🗡️ **Quest Board** - Track habits as RPG quests with XP and Gold rewards
- 🛡️ **Divine Shield** - Streak protection system (7-day cooldown)
- 📊 **Chronicles** - Analytics dashboard with weekly trends
- 🏪 **The Bazaar** - Reward shop to spend earned Gold
- 🔮 **Spirit Guide** - AI-powered advice (requires Gemini API key)
- ✨ **Level Up System** - Class evolution and milestone celebrations

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API (optional)
- **Styling**: CSS with custom dark RPG theme

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/slemo54/LifeQuests.git
cd LifeQuests
npm install
```

### 2. Environment Variables

Create a `.env.local` file with:

```bash
# Gemini API Key (optional, for Spirit Guide AI)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=https://rgzpfnydmzpykoatfbcv.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run locally

```bash
npm run dev
```

## Deployment to Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy!

## Database Schema

The app uses 4 Supabase tables:
- `user_stats` - Hero stats (level, xp, gold, hp)
- `habits` - Quest definitions and progress
- `rewards` - Bazaar items
- `completion_history` - Analytics data

## License

MIT © Anselmo Acquah
