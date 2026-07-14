import { NextResponse } from "next/server";

interface InquiryPayload {
  name: string;
  phone: string;
  category: string;
  package: string;
  month: string;
  message: string;
  page: string;
}

const MAX_FIELD_LENGTH = 1000;

function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_FIELD_LENGTH);
}

/**
 * Receives inquiry-form submissions and forwards them to a Google Apps
 * Script web app (which appends a row to a Google Sheet). The client
 * fires this request just before redirecting to WhatsApp, so this route
 * must never block or fail the user journey — it always returns ok and
 * only logs delivery problems.
 */
export async function POST(request: Request) {
  let body: Partial<InquiryPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const record = {
    submittedAt: new Date().toISOString(),
    name: sanitize(body.name),
    phone: sanitize(body.phone),
    category: sanitize(body.category),
    package: sanitize(body.package),
    month: sanitize(body.month),
    message: sanitize(body.message),
    page: sanitize(body.page),
  };

  if (!record.name && !record.phone) {
    return NextResponse.json({ ok: false, error: "Missing name/phone" }, { status: 400 });
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[inquire] GOOGLE_SHEETS_WEBHOOK_URL not set; inquiry not persisted", record);
    return NextResponse.json({ ok: true });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    // Apps Script web apps respond to POST with a 302 to a googleusercontent
    // URL; follow redirects so the append actually completes.
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      console.error(`[inquire] Sheets webhook responded ${response.status}`, record);
    }
  } catch (err) {
    console.error("[inquire] Sheets webhook failed", (err as Error).message, record);
  }

  return NextResponse.json({ ok: true });
}
