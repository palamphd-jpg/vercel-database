# 💎 Mayna Diamonds — Feedback Collection Form

A modern, elegant feedback collection form for **Mayna Diamonds**, a premium jewelry store in Salem, Tamil Nadu.

Built with **Next.js 15** (App Router), **Tailwind CSS v4**, and **Vercel Postgres** as the database. Deploys cleanly to Vercel and still gives you a downloadable Excel file of all feedback at any time.

---

## 🏗️ Architecture

```
Browser (Customer)
    │
    ▼
┌──────────────────────┐
│   Next.js Frontend   │
│   /api/feedback      │  ← Next.js API route
└──────────┬───────────┘
           │  appendFeedback()
           ▼
┌──────────────────────┐
│   Vercel Postgres     │  ← Real database, persists across requests/deploys
└──────────┬───────────┘
           │  readDatabaseFile() builds this on demand
           ▼
┌──────────────────────┐
│   feedback.xlsx        │  ← Generated in memory from DB rows, downloadable
└──────────────────────┘
```

- The **frontend** only talks to `/api/feedback`.
- The **API route** validates the input and calls a small helper (`src/lib/excel.ts`).
- That helper inserts one row per submission into a Postgres table.
- Visiting `/api/feedback` in a browser builds a fresh `.xlsx` file from all rows in the database and downloads it — so you still get a normal Excel file whenever you want one, without storing it on disk.

> **Why not just write an .xlsx file to disk (the original approach)?** Vercel's serverless functions run on a **read-only, non-persistent filesystem**. Any file written during a request is gone by the next one, so every submission would fail with a "Server configuration error." Postgres is a real, persistent database, so it works correctly on Vercel.

---

## 📋 Setup Guide

### Step 1: Create a Postgres database on Vercel

1. Open your project on [vercel.com](https://vercel.com) → **Storage** tab → **Create Database** → choose **Postgres** (Neon).
2. Once created, click **Connect Project** and select this project. Vercel automatically adds the required environment variables (`POSTGRES_URL`, etc.) to your deployment — no manual `.env` editing needed on Vercel itself.
3. Redeploy the project (Vercel will usually prompt you to, or push a new commit).

### Step 2: Install dependencies locally

```bash
npm install
```

### Step 3: Run it locally (optional)

To test locally against the same database, pull the environment variables Vercel created:

```bash
npm i -g vercel
vercel link
vercel env pull .env.development.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the form.

### Step 4: Deploy

```bash
git add .
git commit -m "Switch storage to Vercel Postgres"
git push
```

Vercel will redeploy automatically. The database table (`feedback`) is created automatically on first use — no manual migration step needed.

---

## 🎨 Features

- ✅ Responsive, mobile-first design with a custom jewelry-store visual identity (deep onyx background, gold accents, diamond-cut rating control)
- ✅ Client-side and server-side form validation
- ✅ Loading spinner on submit and a success confirmation screen
- ✅ Persistent storage that works correctly on Vercel
- ✅ Built-in export: visit `/api/feedback` in a browser to download an up-to-date `feedback.xlsx`

---

## 📁 Project Structure

```
mayna-feedback-offline/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── feedback/
│   │   │       └── route.ts        # Validates input, writes to DB, serves export
│   │   ├── globals.css             # Tailwind + brand styles
│   │   ├── layout.tsx              # Root layout with fonts & SEO
│   │   └── page.tsx                # Feedback form UI
│   └── lib/
│       └── excel.ts                # Reads/writes feedback via @vercel/postgres,
│                                    # builds an .xlsx export on demand
├── package.json
├── tailwind.config / postcss.config
└── README.md
```

---

## 📊 Viewing & backing up your data

- **Download via the app:** visit `https://<your-deployment>.vercel.app/api/feedback` in your browser to download a current copy of all feedback as `feedback.xlsx`.
- **Browse directly:** open the **Storage** tab on your Vercel project → your Postgres database → **Data** to query or browse rows directly.
- **Back up:** periodically download the `.xlsx` export and store it wherever you keep other business records.

Each row records: **Timestamp, Rating (1–5), Name, Phone, Staff Experience, Comments.**

---

## 🔧 Troubleshooting

| Issue | Solution |
|---|---|
| "Server configuration error" on submit | Make sure a Postgres database is connected to the project in Vercel's **Storage** tab, and that you've redeployed after connecting it |
| Works locally but not on Vercel (or vice versa) | Run `vercel env pull .env.development.local` again to make sure your local `.env` matches the deployed database's connection string |
| Ratings or category won't save | Make sure a rating (1–5 diamonds) and a category are selected — both are required fields |
| `/api/feedback` download is empty | No feedback has been submitted yet — the export will just contain the header row |

---

## 📄 License

Private — Mayna Diamonds © 2026
