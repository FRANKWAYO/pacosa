// Vercel Serverless Function: POST /api/notify
// Sends an admin-notification email via Resend when someone submits a
// membership application or a contact-form message. Runs server-side, so the
// Resend API key never reaches the browser.
//
// Required environment variables (set in Vercel → Settings → Environment Variables):
//   RESEND_API_KEY   — from resend.com dashboard
//   NOTIFY_FROM      — a verified sender, e.g. "PACOSA <notifications@yourdomain.org>"
//   NOTIFY_TO        — comma-separated recipient emails, e.g. "admin@pacosa.org,manager@pacosa.org"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM;
  const toList = (process.env.NOTIFY_TO || "").split(",").map(s => s.trim()).filter(Boolean);

  if (!apiKey || !from || toList.length === 0) {
    // Fail quietly (200) so the site doesn't show an error to visitors just
    // because email isn't configured yet — the submission itself already
    // succeeded and was saved to the database.
    console.warn("[notify] Email not configured — skipping send.");
    return res.status(200).json({ sent: false, reason: "not_configured" });
  }

  const { type, subject, text } = req.body || {};
  if (!subject || !text) {
    return res.status(400).json({ error: "subject and text are required" });
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: toList,
        subject: `[PACOSA] ${subject}`,
        text: `${text}\n\n— Automated notification (${type || "site"})`,
      }),
    });

    if (!r.ok) {
      const errBody = await r.text();
      console.error("[notify] Resend error:", errBody);
      return res.status(200).json({ sent: false, reason: "provider_error" });
    }

    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error("[notify] Unexpected error:", err);
    return res.status(200).json({ sent: false, reason: "exception" });
  }
}
