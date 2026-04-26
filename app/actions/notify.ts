"use server";

export type NotifyPayload = {
  event: "booking_page_visit" | "booking_completed";
  studentName?: string;
  studentEmail?: string;
  sessionTime?: string;
};

/**
 * Sends a WhatsApp notification via one of three methods:
 * 1. Webhook (Zapier / Make.com) — set WHATSAPP_WEBHOOK_URL
 * 2. Green-API          — set GREEN_API_INSTANCE_ID + GREEN_API_TOKEN + GREEN_API_PHONE
 * 3. Twilio             — set TWILIO_* vars
 *
 * Falls back gracefully if no env vars are configured (dev mode).
 */
export async function sendWhatsAppNotification(payload: NotifyPayload): Promise<{ ok: boolean }> {
  const message = buildMessage(payload);

  // --- Option A: Generic Webhook (Zapier / Make) ---
  if (process.env.WHATSAPP_WEBHOOK_URL) {
    const res = await fetch(process.env.WHATSAPP_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, ...payload }),
    });
    return { ok: res.ok };
  }

  // --- Option B: Green-API ---
  if (process.env.GREEN_API_INSTANCE_ID && process.env.GREEN_API_TOKEN) {
    const instanceId = process.env.GREEN_API_INSTANCE_ID;
    const token = process.env.GREEN_API_TOKEN;
    const phone = process.env.GREEN_API_PHONE ?? "";
    const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: `${phone}@c.us`, message }),
    });
    return { ok: res.ok };
  }

  // --- Option C: Twilio ---
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const params = new URLSearchParams({
      Body: message,
      From: process.env.TWILIO_FROM ?? "",
      To: process.env.TWILIO_TO ?? "",
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );
    return { ok: res.ok };
  }

  // No provider configured — log for development
  console.info("[WhatsApp Notify]", message);
  return { ok: true };
}

function buildMessage(payload: NotifyPayload): string {
  const ts = new Date().toLocaleString("en-IL", { timeZone: "Asia/Jerusalem" });
  if (payload.event === "booking_page_visit") {
    return `📅 *New Booking Page Visit*\nTime: ${ts}`;
  }
  return [
    `✅ *New Booking Confirmed!*`,
    `Student: ${payload.studentName ?? "Unknown"}`,
    `Email: ${payload.studentEmail ?? "-"}`,
    payload.sessionTime ? `Session: ${payload.sessionTime}` : "",
    `Time: ${ts}`,
  ]
    .filter(Boolean)
    .join("\n");
}
