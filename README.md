# ATOMICS

**A swap tracker, not a habit tracker.** Replace one default behavior at a time,
in its trigger slot, with a load-neutral upgrade — and let it compound.

Built with **Expo / React Native + TypeScript**, **Supabase** (auth + data), and
push notifications (**APNs** on iOS, **FCM** on Android). Organized with a
feature-based clean architecture.

> **The thesis:** No fragile streaks. Each atomic is an if-then plan that only
> graduates once it has survived hard days. One active atomic at a time — the app
> refuses to let you stack.

---

## Quick start

```bash
npm install
cp .env.example .env        # add your Supabase URL + anon key
npx expo start
```

Then scan the QR code with Expo Go. For push notifications and full setup
(Supabase schema, Firebase/FCM, EAS), see **[docs/SETUP.md](docs/SETUP.md)**.

---

## Architecture

Layered, feature-based clean architecture — each feature owns its full slice:

```
view → service → repository → api → adapter → types
```

- **api** — raw Supabase calls
- **adapter** — map raw rows → domain models
- **repository** — React Query hooks (data access + caching)
- **service** — business rules (the swap model, graduation, validation)
- **view / components** — presentation only

```
src/
├─ supabase-instance.ts   # shared data gateway
├─ query-client.ts        # React Query setup
├─ lib/ • types/          # helpers and domain models
├─ navigation/            # splash → onboarding → auth → home
└─ features/
   ├─ auth/               # email/password via Supabase
   ├─ atomics/            # the core tracker
   ├─ notifications/      # push (APNs/FCM) + daily local reminder
   └─ onboarding/         # how-to-use walkthrough
```

## Features

- **Email auth** with secure on-device token storage
- **Cloud sync** of atomics and daily check-ins (Supabase + RLS)
- **Charge model** that never resets to zero; graduation gated on 2+ hard days
- **One-at-a-time queue** with automatic promotion on graduation
- **Onboarding** walkthrough on first launch
- **Daily reminder** + remote push (APNs on iOS, FCM on Android)

## Scripts

```bash
npx tsc --noEmit     # type-check
npx expo start       # dev
npx eas build        # builds
```
