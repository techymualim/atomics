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
- A **Firebase** project (for Android/iOS push) → https://console.firebase.google.com
- For push notifications on a real build: an **Expo (EAS)** account → https://expo.dev

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

## 3. Firebase Cloud Messaging (push notifications)

Expo routes Android pushes through **FCM** and iOS through **APNs**. Local
reminders (the daily check-in nudge) work without any of this — but to send
remote pushes you need the steps below.

### 3a. Android (FCM)

1. In the [Firebase console](https://console.firebase.google.com), create (or
   open) a project and **add an Android app** with package name
   `com.atomics.app` (must match `app.json`).
2. Download **`google-services.json`** and place it in the project root
   (the path is already referenced by `app.json` → `android.googleServicesFile`).
3. In **Firebase → Project Settings → Cloud Messaging**, make sure the
   **Firebase Cloud Messaging API (V1)** is enabled.
4. Give Expo the FCM credentials so its push service can deliver to your app:
   ```bash
   npx eas credentials
   ```
   Select **Android → Push Notifications (FCM V1)** and upload the service
   account JSON from Firebase (**Project Settings → Service accounts →
   Generate new private key**).

### 3b. iOS (APNs)

1. Add an **iOS app** to the same Firebase project with bundle id
   `com.atomics.app` and download **`GoogleService-Info.plist`** into the
   project root (referenced by `app.json` → `ios.googleServicesFile`).
2. You need an Apple Developer account. Let EAS manage the APNs key:
   ```bash
   npx eas credentials
   ```
   Select **iOS → Push Notifications** and let EAS create/upload the key.

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

### Development build (full push support)

```bash
npx expo install expo-dev-client
npx eas build --profile development --platform android   # or ios
```

Install the resulting build on a physical device, then `npx expo start
--dev-client`.

### Sending a test push

Once a device has registered, its token is stored in the `push_tokens` table.
Quick test via Expo's push tool:

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{"to":"ExponentPushToken[xxx]","title":"ATOMICS","body":"Run the move?"}'
```

For production, send from a **Supabase Edge Function** that reads `push_tokens`
and calls the Expo push API (or FCM directly).

---

## 5. How the app works (user flow)

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

## 6. Type checking & scripts

```bash
npx tsc --noEmit     # type-check the whole project
npx expo start       # run in development
npx eas build        # production / dev builds
```

---

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| `Invalid API key` on sign-in | Check `.env` values and restart `expo start -c` |
| Rows not saving | Confirm `schema.sql` ran and RLS policies exist |
| No push token | Use a real device + dev build (not Expo Go), and set `extra.eas.projectId` |
| Android push silent | Verify `google-services.json` + FCM V1 credentials in `eas credentials` |
| Reminder never fires | Grant notification permission; the daily trigger fires at the next 09:00 |
