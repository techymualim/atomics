# Atomics — Setup Guide

A swap-based behavior tracker built with **Expo / React Native + TypeScript**,
backed by **Supabase** (auth + database) and **Firebase Cloud Messaging** (push
notifications). This guide takes you from a fresh clone to a running app with
working auth, data sync, and notifications.

---

## 0. Prerequisites

- **Node 18+** and npm
- **Expo** tooling (`npx expo …`, no global install needed)
- A **Supabase** account → https://supabase.com
- For push notifications on a real build: an **Expo (EAS)** account → https://expo.dev
- **iOS:** a paid **Apple Developer** account (required by APNs)
- **Android only:** a **Firebase** project (FCM transport) → https://console.firebase.google.com

```bash
git clone <repo-url>
cd atomics
npm install
```

---

## 1. Architecture (clean, feature-based)

The codebase follows a layered clean architecture, organized by feature. Each
feature owns its full vertical slice:

```
src/
├─ supabase-instance.ts      # shared data gateway (like an axios instance)
├─ query-client.ts           # React Query client + cache keys
├─ lib/                      # framework-agnostic helpers (theme, dates, metrics, seed)
├─ types/                    # domain models (Atomic, DayLog, AppUser)
├─ navigation/
│  └─ root-navigator.tsx     # splash → onboarding → auth → home
└─ features/
   ├─ auth/
   │  ├─ auth-api.ts         # data layer: raw Supabase auth calls
   │  ├─ auth-adapter.ts     # raw user → domain AppUser
   │  ├─ auth-context.tsx    # session state (repository for the session)
   │  ├─ auth-service.ts     # use-cases + validation (sign in / up / out)
   │  └─ views/auth-view.tsx # presentation
   ├─ atomics/
   │  ├─ atomic-api.ts / log-api.ts          # data layer
   │  ├─ atomic-adapter.ts / log-adapter.ts  # row → domain mappers
   │  ├─ atomic-repository.ts                # React Query hooks (data access)
   │  ├─ atomic-service.ts                   # business rules (swap model, graduation)
   │  ├─ components/                         # presentational pieces
   │  └─ views/home-view.tsx                 # screen composition
   ├─ notifications/
   │  ├─ notification-api.ts      # persist push token in Supabase
   │  └─ notification-service.ts  # permissions, FCM register, daily reminder
   └─ onboarding/
      ├─ onboarding-storage.ts    # "seen" flag
      ├─ components/ • views/      # how-to-use walkthrough
```

**Layer rule of thumb:** `view → service → repository → api → adapter → types`.
Views never call the API directly; business rules live only in services.

---

## 2. Supabase setup

1. Create a new project at https://supabase.com/dashboard.
2. Open **SQL Editor** and run the full contents of
   [`supabase/schema.sql`](../supabase/schema.sql). This creates the
   `atomics`, `logs`, and `push_tokens` tables, indexes, and **Row Level
   Security** policies (each user only sees their own rows).
3. Under **Project Settings → API**, copy:
   - **Project URL**
   - **anon public** key
4. (Optional) Under **Authentication → Providers → Email**, decide whether to
   require email confirmation. If you disable confirmation, sign-up logs the
   user straight in.

### Environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env
```

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

`EXPO_PUBLIC_*` vars are inlined by Expo at build time and read in
`src/supabase-instance.ts`. **Never** put the `service_role` key in the app.

---

## 3. Push notifications

How the transport works:

- **iOS** — Expo's push service delivers straight to **APNs**. You do **not**
  need Firebase on iOS. (Firebase/FCM on iOS is only relevant if you swap in the
  native `@react-native-firebase/messaging` SDK, which this app does not use.)
- **Android** — Expo's push service delivers through **Firebase Cloud
  Messaging (FCM)**, so Android needs a Firebase project + `google-services.json`.

The **daily check-in reminder** is a *local* notification — it needs only
notification permission and works on a simulator/device without any of the
backend credentials below.

### 3a. iOS (APNs) — primary path

1. You need a paid **Apple Developer account** ($99/yr) — APNs requires it.
2. Set your EAS project id (see §3c) and `ios.bundleIdentifier` in `app.json`
   (already `com.atomics.app` — change it to something you own).
3. Let EAS create and upload the APNs key for you:
   ```bash
   npx eas credentials
   ```
   Select **iOS → Push Notifications: Manage your Apple Push Notifications Key**
   → *Set up a new key*. EAS stores it; you never touch certificates by hand.
4. The push capability/entitlement (`aps-environment`) and the
   `remote-notification` background mode are added automatically by the
   `expo-notifications` plugin + `app.json` during the build — no manual Xcode
   steps.

> iOS push tokens only resolve on a **real device** with a **dev/production
> build** (not Expo Go, not the simulator). Local reminders work on the
> simulator.

### 3b. Android (FCM) — only if you also ship Android

1. In the [Firebase console](https://console.firebase.google.com), create a
   project and **add an Android app** with package `com.atomics.app`.
2. Download **`google-services.json`** into the project root (referenced by
   `app.json` → `android.googleServicesFile`).
3. Enable the **Cloud Messaging API (V1)** under Project Settings → Cloud
   Messaging.
4. Upload the FCM V1 service-account key to EAS:
   ```bash
   npx eas credentials
   ```
   Select **Android → Push Notifications (FCM V1)**.

### 3c. EAS project id

Push tokens require a real EAS project id. Create one and paste it into
`app.json` → `extra.eas.projectId`:

```bash
npx eas init
```

> **Note:** Push notifications do **not** work in Expo Go for SDK 53+. Build a
> development client (next section) to test them on a device.

---

## 4. Running the app

### Local development (Expo Go — auth + data + local reminders)

```bash
npx expo start
```

Scan the QR code with Expo Go. Email auth, Supabase sync, onboarding, and the
**scheduled local reminder** all work here. Remote FCM pushes do not.

### iOS development build (full push support)

Remote push needs a real build on a real device. The build profiles live in
`eas.json`.

```bash
npx expo install expo-dev-client
npx eas build --profile development --platform ios
```

EAS handles signing and the APNs key (§3a). Install the build on your iPhone,
then start the dev server and open it from the app:

```bash
npx expo start --dev-client
```

> On a Mac you can also run locally with `npx expo run:ios` (requires Xcode).
> The iOS **simulator** runs the app and local reminders but cannot receive
> remote push tokens — use a physical device for those.

The same command with `--platform android` builds the Android dev client if you
ever ship there.

### Sending a test push

Once a device has registered, its token is stored in the `push_tokens` table.
Quick test via Expo's push tool:

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{"to":"ExponentPushToken[xxx]","title":"ATOMICS","body":"Run the move?"}'
```

---

## 5. Server-side daily nudge (Supabase Edge Function + pg_cron)

The app already schedules a **local** daily reminder on the device. But if the
user force-quits the app or hasn't opened it in days, local notifications stop
firing. The **daily-nudge Edge Function** solves this: it runs on a cron
schedule, checks which users haven't logged today, and pushes a reminder through
Expo's push service (→ APNs on iOS, → FCM on Android).

### 5a. Deploy the Edge Function

Install the [Supabase CLI](https://supabase.com/docs/guides/cli) if you haven't:

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Set the secret the cron job uses to authenticate with the function:

```bash
supabase secrets set CRON_SECRET=$(openssl rand -hex 32)
```

Deploy:

```bash
supabase functions deploy daily-nudge --no-verify-jwt
```

`--no-verify-jwt` is used because the function authenticates via the
`CRON_SECRET` header instead of a user JWT — it runs as a service-role call,
not on behalf of a logged-in user.

### 5b. Schedule with pg_cron

Open the **SQL Editor** in your Supabase dashboard and run
[`supabase/cron.sql`](../supabase/cron.sql). This schedules the function to
fire every day at **09:00 UTC**.

Before running the SQL, set the two `app.settings` values the cron job reads.
Go to **Dashboard → Project Settings → Configuration → Database → Custom
Configuration** and add:

| Setting | Value |
|---|---|
| `app.settings.supabase_url` | `https://YOUR-PROJECT.supabase.co` |
| `app.settings.cron_secret` | The same value you used in `supabase secrets set` |

To change the schedule time, see the comment at the bottom of `cron.sql`.

### 5c. How it works

1. Queries all users with an active (non-graduated) atomic AND at least one
   registered push token.
2. Left-joins today's logs — any user who has already logged a `ran` or `missed`
   is skipped (no duplicate nagging).
3. Sends the remaining tokens to Expo's push endpoint in batches of 100.
4. Cleans up `DeviceNotRegistered` tokens automatically (stale installs).

### 5d. Verifying the function

Invoke it manually to make sure it works before waiting for the cron:

```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/daily-nudge \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

You should get a JSON response like `{"sent":1,"total":1,"errors":[]}`.

> **Requires pg_cron + pg_net** (enabled by default on **Supabase Pro**). On the
> free tier, use an external scheduler (GitHub Actions, Vercel Cron, Railway,
> cron-job.org) that hits the function URL on a schedule instead.

---

## 6. How the app works (user flow)

1. **Onboarding** — a 4-screen walkthrough explaining the swap model, daily
   check-ins, hard-day scoring, and the one-at-a-time queue. Shown once.
2. **Auth** — email + password via Supabase. New accounts are auto-seeded with
   the four starter atomics.
3. **Home**
   - The **active atomic** shows its if-then plan, charge ring, and today's
     check-in (✓ Ran / ✕ Missed, plus a ⚡ slammed-day toggle).
   - **Charge** accumulates and never resets; an atomic **graduates** at 100%
     charge once it has held on **2+ hard days**, then the next queued atomic
     unlocks automatically.
   - A **daily reminder** can be toggled on (local notification at 09:00).

---

## 7. Type checking & scripts

```bash
npx tsc --noEmit     # type-check the whole project
npx expo start       # run in development
npx eas build        # production / dev builds
```

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| `Invalid API key` on sign-in | Check `.env` values and restart `expo start -c` |
| Rows not saving | Confirm `schema.sql` ran and RLS policies exist |
| No push token | Use a real device + dev build (not Expo Go / simulator), and set `extra.eas.projectId` |
| iOS push silent | Confirm the APNs key is set in `eas credentials` and you're on a physical device |
| Android push silent | Verify `google-services.json` + FCM V1 credentials in `eas credentials` |
| Reminder never fires | Grant notification permission; the daily trigger fires at the next 09:00 |
| Edge Function returns 401 | `CRON_SECRET` doesn't match between `supabase secrets` and `app.settings` |
| Edge Function returns 500 | Check Supabase logs; likely a missing `push_tokens` table or RLS policy |
| No nudge after force-quit | Deploy the Edge Function (§5) — local reminders stop when the app is killed |
