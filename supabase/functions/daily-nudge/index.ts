// supabase/functions/daily-nudge/index.ts
//
// Runs once a day (via pg_cron or an external scheduler).
// For every user who has an active (non-graduated) atomic AND hasn't checked in
// today, sends a push notification through Expo's push service (which routes
// to APNs on iOS, FCM on Android — no direct Firebase SDK needed).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface PushMessage {
  to: string;
  title: string;
  body: string;
  sound: "default" | null;
  data?: Record<string, unknown>;
  channelId?: string;
}

interface PushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error: string };
}

Deno.serve(async (req) => {
  // Optional: protect with a shared secret so only your cron can call it.
  const authHeader = req.headers.get("authorization") ?? "";
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // 1. Find users who have an active atomic but no log entry for today.
  //    We join atomics → push_tokens and left-join logs to check for today.
  const { data: candidates, error: queryErr } = await supabase
    .from("atomics")
    .select(
      `
      user_id,
      name,
      push_tokens!inner ( token, platform )
    `
    )
    .eq("is_active", true)
    .eq("graduated", false);

  if (queryErr) {
    console.error("Query error:", queryErr);
    return Response.json({ error: queryErr.message }, { status: 500 });
  }

  if (!candidates || candidates.length === 0) {
    return Response.json({ sent: 0, reason: "no active atomics with tokens" });
  }

  // 2. For each candidate, check if they already logged today.
  const userIds = [...new Set(candidates.map((c: any) => c.user_id))];
  const { data: todayLogs } = await supabase
    .from("logs")
    .select("user_id, atomic_id, status")
    .in("user_id", userIds)
    .eq("date", todayStr)
    .not("status", "is", null);

  const loggedUserIds = new Set((todayLogs ?? []).map((l: any) => l.user_id));

  // 3. Build the push messages for users who haven't checked in.
  const messages: PushMessage[] = [];

  for (const row of candidates as any[]) {
    if (loggedUserIds.has(row.user_id)) continue;

    const tokens: { token: string; platform: string }[] = Array.isArray(
      row.push_tokens
    )
      ? row.push_tokens
      : [row.push_tokens];

    for (const { token, platform } of tokens) {
      messages.push({
        to: token,
        title: "ATOMICS",
        body: `Did ${row.name} run today? Two seconds to log it.`,
        sound: "default",
        channelId: platform === "android" ? "default" : undefined,
      });
    }
  }

  if (messages.length === 0) {
    return Response.json({ sent: 0, reason: "all users already checked in" });
  }

  // 4. Send in batches of 100 (Expo's limit per request).
  let sent = 0;
  const errors: string[] = [];

  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      });

      const tickets: PushTicket[] = await res.json();

      for (const ticket of tickets) {
        if (ticket.status === "ok") {
          sent++;
        } else {
          const msg = ticket.details?.error ?? ticket.message ?? "unknown";
          errors.push(msg);
          // If the token is invalid, clean it up.
          if (ticket.details?.error === "DeviceNotRegistered") {
            const badToken = batch[tickets.indexOf(ticket)]?.to;
            if (badToken) {
              await supabase
                .from("push_tokens")
                .delete()
                .eq("token", badToken);
            }
          }
        }
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  console.log(`Sent ${sent}/${messages.length} nudges, ${errors.length} errors`);

  return Response.json({ sent, total: messages.length, errors });
});
