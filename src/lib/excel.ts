import ExcelJS from "exceljs";
import { sql } from "@vercel/postgres";

// The "database" is now Postgres (via Vercel Postgres). This module still
// exposes an Excel export (readDatabaseFile) so the admin download workflow
// at GET /api/feedback stays exactly the same — it just builds the .xlsx
// on the fly from the current rows instead of reading it off disk.
//
// Vercel's serverless functions run on a read-only, non-persistent
// filesystem, so writing an .xlsx file to disk (the original approach)
// silently fails on every deploy. Postgres persists correctly between
// requests and across deployments.

const SHEET_NAME = "Feedback";

const HEADERS = [
  "Timestamp",
  "Rating",
  "Name",
  "Phone",
  "Staff Experience",
  "Comments",
] as const;

export interface FeedbackEntry {
  rating: number;
  name: string;
  phone: string;
  staffExperience: string;
  comments: string;
}

let tableEnsured: Promise<void> | null = null;

// Creates the feedback table if it doesn't exist yet. Safe to call on every
// request — CREATE TABLE IF NOT EXISTS is a no-op once the table exists.
// Cached in-process so we don't re-check on every single call.
function ensureTable(): Promise<void> {
  if (!tableEnsured) {
    tableEnsured = sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        rating INTEGER NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        staff_experience TEXT NOT NULL,
        comments TEXT NOT NULL
      );
    `.then(() => undefined);
  }
  return tableEnsured;
}

/**
 * Inserts one feedback entry as a new row in Postgres.
 */
export async function appendFeedback(entry: FeedbackEntry): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO feedback (rating, name, phone, staff_experience, comments)
    VALUES (${entry.rating}, ${entry.name}, ${entry.phone}, ${entry.staffExperience}, ${entry.comments});
  `;
}

/**
 * Builds an .xlsx workbook in memory from all current rows in Postgres and
 * returns its raw bytes. Used for the "download the spreadsheet" admin
 * export at GET /api/feedback.
 */
export async function readDatabaseFile(): Promise<Buffer> {
  await ensureTable();
  const { rows } = await sql`
    SELECT created_at, rating, name, phone, staff_experience, comments
    FROM feedback
    ORDER BY created_at ASC;
  `;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(SHEET_NAME);
  sheet.addRow([...HEADERS]);
  sheet.getRow(1).font = { bold: true };
  sheet.columns = [
    { width: 22 }, // Timestamp
    { width: 10 }, // Rating
    { width: 24 }, // Name
    { width: 16 }, // Phone
    { width: 18 }, // Staff Experience
    { width: 50 }, // Comments
  ];

  for (const row of rows) {
    sheet.addRow([
      new Date(row.created_at as string).toISOString(),
      row.rating,
      row.name,
      row.phone,
      row.staff_experience,
      row.comments,
    ]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function databaseExists(): Promise<boolean> {
  await ensureTable();
  const { rows } = await sql`SELECT 1 FROM feedback LIMIT 1;`;
  return rows.length > 0;
}
