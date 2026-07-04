import { NextRequest, NextResponse } from "next/server";
import { appendFeedback, readDatabaseFile } from "@/lib/excel";

const VALID_STAFF_OPTIONS = ["Pleasant", "Very Good", "Good", "Not Bad", ""];

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { rating, name, phone, staffExperience, comments } = (body ?? {}) as Record<
    string,
    unknown
  >;

  // --- Server-side validation ---
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json(
      { error: "Please provide a rating between 1 and 5." },
      { status: 400 }
    );
  }

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 }
    );
  }

  if (typeof phone !== "string" || !/^[0-9+\-\s()]{7,15}$/.test(phone.trim())) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 }
    );
  }

  const staffExperienceStr =
    typeof staffExperience === "string" ? staffExperience : "";
  if (!VALID_STAFF_OPTIONS.includes(staffExperienceStr)) {
    return NextResponse.json(
      { error: "Please select a valid staff experience option." },
      { status: 400 }
    );
  }

  const commentsStr = typeof comments === "string" ? comments.trim() : "";

  try {
    await appendFeedback({
      rating: ratingNum,
      name: name.trim(),
      phone: phone.trim(),
      staffExperience: staffExperienceStr,
      comments: commentsStr,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to write feedback:", err);
    return NextResponse.json(
      { error: "Server configuration error. Please try again later.", debug: message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// GET /api/feedback  -> lets an admin download the current feedback.xlsx
// straight from the browser (e.g. visit the URL directly).
export async function GET() {
  try {
    const fileBuffer = await readDatabaseFile();
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="mayna-feedback.xlsx"',
      },
    });
  } catch (err) {
    console.error("Failed to read Excel file:", err);
    return NextResponse.json(
      { error: "Could not read the feedback database." },
      { status: 500 }
    );
  }
}
