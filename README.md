# Notes App

A full-stack note-taking application with JWT auth, Supabase database, and optional Groq AI features.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (bcryptjs + jsonwebtoken) |
| AI (optional) | Groq API — note summarisation & MCQ generation |

## Project Structure

```
notes-app/
├── client/          # Next.js 14 frontend (App Router)
│   └── src/
│       ├── app/     # Pages: /, /login, /register, /dashboard
│       ├── components/
│       └── lib/api.js   # Centralised fetch wrapper
├── server/          # Express.js backend
│   └── src/
│       ├── routes/  # auth.js, notes.js, health.js
│       ├── middleware/  # protect.js (JWT), errorHandler.js
│       ├── services/    # groqService.js (AI)
│       ├── config/      # supabase.js
│       └── utils/       # jwt.js
├── package.json     # Root — run both together with concurrently
└── .env.example     # Full env variable reference
```

## Quick Start

### 1. Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com) project (free tier works)

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd notes-app
npm run install:all
```

### 3. Set Up Environment Variables

**Server** — copy and fill in:
```bash
cp server/.env.example server/.env
```

**Client** — copy and fill in:
```bash
cp client/.env.local.example client/.env.local
```

### 4. Set Up the Database

Run the SQL schema in your Supabase SQL editor:
```bash
# Open server/src/schema.sql and run it in Supabase dashboard
```

### 5. Run in Development
```bash
npm run dev
```
This starts both the client (port 3000) and server (port 5000) concurrently.

Or run individually:
```bash
npm run dev:client   # http://localhost:3000
npm run dev:server   # http://localhost:5000
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/health | No | Server health check |
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/notes | Yes | Get all notes |
| GET | /api/notes/:id | Yes | Get single note |
| POST | /api/notes | Yes | Create note |
| PUT | /api/notes/:id | Yes | Update note |
| DELETE | /api/notes/:id | Yes | Delete note |
| POST | /api/notes/:id/summarise | Yes | AI summarise (Groq) |

## Deployment

- **Frontend**: Connect `client/` to [Vercel](https://vercel.com) — set `NEXT_PUBLIC_API_URL` to your server URL
- **Backend**: Deploy `server/` to [Railway](https://railway.app) or [Render](https://render.com)
- **Database**: Already hosted on Supabase

## Optional: Enable AI Features

1. Get a free API key at [console.groq.com](https://console.groq.com)
2. Add `GROQ_API_KEY=your_key` to `server/.env`
3. Run `npm install groq-sdk` inside `server/`
4. Uncomment the Groq code in `server/src/services/groqService.js`

## License
MIT
