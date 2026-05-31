-- Schedule the daily-nudge Edge Function via pg_cron.
-- Requires the pg_cron extension (enabled by default on Supabase Pro plans).
-- Adjust the cron time to your timezone; this fires at 09:00 UTC daily.
--
-- Before running this, set the CRON_SECRET in your Supabase project's
-- Edge Function secrets (Dashboard → Edge Functions → Secrets):
--   supabase secrets set CRON_SECRET=<your-random-secret>

-- Enable the extensions (safe to re-run)
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- Schedule: every day at 09:00 UTC
select cron.schedule(
  'daily-nudge',
  '0 9 * * *',
  $$
  select net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/daily-nudge',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- To change the time, drop and re-create:
--   select cron.unschedule('daily-nudge');
--   select cron.schedule('daily-nudge', '0 21 * * *', $$ ... $$);
