# CortexAI

A web-based business memory and operations dashboard for SMEs. Upload your scattered business files — invoices, Excel sheets, customer records, supplier quotes, and meeting notes — and CortexAI turns them into a searchable dashboard with payment alerts, order tracking, supplier comparisons, and an AI-powered Q&A assistant.

## Live Demo

Deploy to Vercel using the instructions below.

## Features

- **File Upload** — CSV, Excel, PDF, TXT, and invoice images (JPG/PNG via OCR)
- **AI Data Extraction** — Gemini 1.5 Flash intelligently structures uploaded files into customers, orders, suppliers, and follow-ups
- **Business Dashboard** — Summary cards: pending payments, overdue orders, active customers, today's follow-ups
- **Customer Panel** — View all customers with dues, last order, and payment status
- **Orders Panel** — Filter by pending/overdue/completed with visual overdue highlighting
- **Supplier Comparison** — Price comparison per item with cheapest supplier highlighted
- **Follow-up Center** — Auto-generated daily action list from overdue orders and pending payments
- **Full-text Search** — Search across all tables simultaneously
- **AI Chatbot** — Ask questions in plain English, answered from your own database only
- **Demo Data** — One-click sample dataset for instant exploration

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Lucide React |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password) |
| File Storage | Supabase Storage |
| OCR | Tesseract.js |
| AI Structuring | Google Gemini 1.5 Flash |
| AI Chatbot | Google Gemini 1.5 Flash |
| Deployment | Vercel |

## Setup

### 1. Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Verify all 5 tables are created and RLS is enabled
4. Go to **Settings → API** and copy your Project URL and anon key
5. Go to **Authentication → Settings** → enable email/password, disable email confirmation (for easy demo)

### 2. Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key** → Create API key (free, no credit card needed)
3. Copy the key

### 3. Local Development

```bash
# Clone the repo
git clone https://github.com/abdullahx404/CortexAI.git
cd CortexAI

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your real Supabase URL, anon key, and Gemini API key

# Run the development server
npm run dev

# Open http://localhost:3000
```

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Add New Project → Import from GitHub
3. Add these environment variables in Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key
```

4. Deploy — Vercel auto-deploys on every push to `main`

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon public key (safe for client with RLS) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key (server-side only) |

## Demo Flow

1. Sign up at `/auth/signup`
2. Go to **Demo Data** → click "Load Demo Data"
3. Go to **Dashboard** → see pending payments, overdue orders
4. Go to **Customers** → see who owes money
5. Go to **Suppliers** → see cheapest supplier for office chairs
6. Go to **Follow-ups** → see daily action list
7. Go to **Search** → search "Ahmed" to see all related records
8. Go to **AI Assistant** → ask "Which customers owe us money?"

## Project Structure

```
src/
  app/           # Next.js pages and API routes
  components/    # React components (UI + layout)
  lib/           # Business logic (extraction, Gemini, Supabase, validation)
  types/         # TypeScript types matching Supabase schema
  middleware.ts  # Auth route protection
supabase-schema.sql  # Full database schema with RLS
```

## Security

- Gemini API key is server-side only — never exposed to the client
- Supabase RLS restricts all data access to authenticated users
- Uploaded files are processed in memory only — never written to disk
- All API routes validate session and input before processing
