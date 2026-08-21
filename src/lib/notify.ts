/**
 * Fire-and-forget call to /api/notify (a Vercel serverless function that
 * emails admins via Resend). Never throws and never blocks the caller —
 * a notification failing should not stop an application or message from
 * being saved, since that already happened in Supabase before this runs.
 */
export function notifyAdmins(type: string, subject: string, text: string) {
  fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, subject, text }),
  }).catch(() => { /* best-effort — ignore network errors */ });
}
