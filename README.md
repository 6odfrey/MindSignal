# Mind Signal

A mental health support app with mood tracking, crisis signposting, professional matching, and messaging — built for the UK market.

---

## What it does

- **Mood tracking** — Log daily mood scores (1–10) with optional notes and tags
- **Crisis detection** — Detects crisis language and surfaces UK support resources automatically
- **UK crisis signposting** — Samaritans, Crisis Text Line, Mind, Papyrus, NHS 111
- **User authentication** — Secure JWT-based auth with bcrypt password hashing
- **Profile management** — Display name, bio, timezone, and avatar upload
- **Mood analytics** — Trends, averages, and daily breakdowns over time
- **Professional matching** — Browse and filter UK therapists, counsellors, psychologists, and more
- **Messaging** — Direct messaging between users and professionals
- **Notifications** — Daily mood reminders and push alerts

---

## Repository structure

```
MindSignal/
├── src/                    # Backend API (Node.js / Express / TypeScript)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── migrations/             # PostgreSQL schema migrations (run in order)
├── mobile/                 # React Native app (Expo)
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── navigation/
│   │   ├── screens/
│   │   └── utils/
│   ├── app.json
│   └── eas.json
└── railway.json            # Railway deployment config
```

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend runtime | Node.js |
| Backend framework | Express |
| Language | TypeScript |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Validation | express-validator |
| Security | helmet, express-rate-limit |
| Mobile | React Native (Expo SDK 56) |
| Mobile navigation | React Navigation 7 |
| Push notifications | Expo Notifications |

---

## Local development

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Clone and install

```bash
git clone https://github.com/6odfrey/MindSignal.git
cd MindSignal
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://your_username@localhost:5432/mind_signal
JWT_SECRET=your-secret-key-minimum-32-characters
```

### 3. Create the database and run migrations

```bash
createdb mind_signal
npm run db:migrate:local
```

### 4. Start the backend

```bash
npm run dev
```

Server runs at `http://localhost:3000`

### 5. Run the mobile app

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` for iOS simulator.

> **Physical device:** update `API_BASE` in [mobile/src/api/client.ts](mobile/src/api/client.ts) to your Mac's local IP, e.g. `http://192.168.1.x:3000/api`.

---

## Deploying the backend (Railway)

Railway is the recommended platform — it provisions Node.js and PostgreSQL together with minimal config.

### Steps

1. Create a free account at [railway.app](https://railway.app)
2. New project → **Deploy from GitHub repo** → select `6odfrey/MindSignal`
3. Add a **PostgreSQL** plugin to the project
4. Set environment variables in Railway dashboard:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Auto-set by Railway PostgreSQL plugin |
| `JWT_SECRET` | A random 32+ character string |
| `NODE_ENV` | `production` |
| `JWT_EXPIRES_IN` | `24h` |

5. Railway auto-runs `npm run build` then `npm run start` (from `railway.json`)
6. Run migrations against the production database:

```bash
DATABASE_URL=<your-railway-db-url> npm run db:migrate
```

---

## Building the mobile app (EAS Build)

EAS Build compiles the iOS and Android binaries without needing Xcode or Android Studio on your machine.

### Prerequisites

```bash
cd /Users/godfrey/projects/MindSignal-clone/mobile && npm install -g eas-cli
cd /Users/godfrey/projects/MindSignal-clone/mobile && eas login
```

### Update the API URL for production

In [mobile/src/api/client.ts](mobile/src/api/client.ts), change `API_BASE` to your Railway URL:

```ts
export const API_BASE = 'https://your-app.up.railway.app/api';
```

### Build for iOS simulator (development)

```bash
cd /Users/godfrey/projects/MindSignal-clone/mobile && eas build --profile development --platform ios
```

### Build for TestFlight / App Store

```bash
cd /Users/godfrey/projects/MindSignal-clone/mobile && eas build --profile production --platform ios
```

### Build for Play Store

```bash
cd /Users/godfrey/projects/MindSignal-clone/mobile && eas build --profile production --platform android
```

### Submit to stores

After a successful production build:

```bash
# iOS
cd /Users/godfrey/projects/MindSignal-clone/mobile && eas submit --platform ios

# Android
cd /Users/godfrey/projects/MindSignal-clone/mobile && eas submit --platform android
```

Fill in your Apple ID / Google Play credentials in `eas.json` before submitting.

---

## API reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/verify` | Bearer | Verify token |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | Bearer | Get profile |
| PUT | `/api/users/me` | Bearer | Update profile |
| POST | `/api/users/avatar` | Bearer | Upload avatar |

### Moods

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/moods` | Bearer | Log mood (auto-detects crisis) |
| GET | `/api/moods` | Bearer | Mood history |
| GET | `/api/moods/analytics` | Bearer | Analytics (`?days=30`) |
| DELETE | `/api/moods/:id` | Bearer | Delete entry |

### Professionals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/professionals` | Bearer | Browse + filter |
| GET | `/api/professionals/saved` | Bearer | Saved professionals |
| GET | `/api/professionals/:id` | Bearer | Single professional |
| POST | `/api/professionals/:id/save` | Bearer | Save |
| DELETE | `/api/professionals/:id/save` | Bearer | Unsave |

### Conversations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/conversations` | Bearer | Start conversation |
| GET | `/api/conversations` | Bearer | List conversations |
| GET | `/api/conversations/:id` | Bearer | Messages (paginated) |
| POST | `/api/conversations/:id/messages` | Bearer | Send message |

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/notifications/token` | Bearer | Register push token |
| GET | `/api/notifications/preferences` | Bearer | Get preferences |
| PUT | `/api/notifications/preferences` | Bearer | Update preferences |

### Crisis resources

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/crisis/resources` | Bearer | List UK crisis resources |

---

## Build roadmap

| Week | Feature | Status |
|------|---------|--------|
| 1 | User authentication & profiles | ✅ Done |
| 2 | Mood tracking & crisis signposting | ✅ Done |
| 3 | Professional matching | ✅ Done |
| 3.5 | React Native mobile app | ✅ Done |
| 4 | Messaging system | ✅ Done |
| 5 | Notifications & reminders | ✅ Done |
| 6 | MVP polish & deployment | ✅ Done |

---

## If you are in crisis

If you are struggling, please reach out:

- **Samaritans:** 116 123 (free, 24/7)
- **Crisis Text Line:** Text SHOUT to 85258 (free, 24/7)
- **Emergency:** 999
