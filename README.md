# Mind Signal

A mental health support app with mood tracking, crisis signposting, and professional matching — built for the UK market.

---

## What it does

- **Mood tracking** — Log daily mood scores (1–10) with optional notes and tags
- **Crisis detection** — Automatically detects crisis language in mood entries and surfaces UK support resources
- **UK crisis signposting** — Samaritans, Crisis Text Line, Mind, Papyrus, NHS 111
- **User authentication** — Secure JWT-based auth with bcrypt password hashing
- **Profile management** — Display name, bio, timezone, and avatar upload
- **Mood analytics** — Trends, averages, and daily breakdowns over time

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express |
| Language | TypeScript |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Validation | express-validator |
| File uploads | multer |

---

## Project Structure

```
mind-signal-backend/
├── src/
│   ├── config/          # Database & environment config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # TypeScript types
│   ├── routes/          # Express routers
│   ├── utils/           # JWT, password, crisis detection
│   └── index.ts         # App entry point
├── migrations/          # SQL schema files
├── uploads/             # Avatar storage (gitignored)
└── .env.example         # Environment variables template
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repo

```bash
git clone https://github.com/6odfrey/MindSignal.git
cd MindSignal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
DATABASE_URL=postgresql://your_username@localhost:5432/mind_signal
JWT_SECRET=your-secret-key-minimum-32-characters
```

### 4. Create the database

```bash
createdb mind_signal
```

### 5. Run migrations

```bash
psql -d mind_signal -f migrations/001_initial_schema.sql
psql -d mind_signal -f migrations/002_moods_crisis.sql
```

### 6. Start the server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Login and receive JWT |
| GET | `/api/auth/verify` | Bearer token | Verify token validity |

**Register body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1",
  "display_name": "Your Name"
}
```

**Login response:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": "uuid", "email": "user@example.com" }
}
```

---

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | Bearer token | Get current user + profile |
| PUT | `/api/users/me` | Bearer token | Update profile |
| POST | `/api/users/avatar` | Bearer token | Upload avatar image |

**Update profile body:**
```json
{
  "display_name": "Your Name",
  "bio": "About you",
  "timezone": "Europe/London"
}
```

---

### Moods

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/moods` | Bearer token | Log a mood entry |
| GET | `/api/moods` | Bearer token | Get mood history |
| GET | `/api/moods/analytics` | Bearer token | Get mood analytics |
| DELETE | `/api/moods/:id` | Bearer token | Delete a mood entry |

**Log mood body:**
```json
{
  "score": 7,
  "note": "Feeling okay today",
  "tags": ["work", "tired"]
}
```

**Crisis response** (triggered automatically when crisis language is detected):
```json
{
  "mood": { ... },
  "crisis_alert": {
    "message": "We noticed you may be struggling. You're not alone — please reach out for support.",
    "resources": [
      {
        "name": "Samaritans",
        "phone": "116 123",
        "available_hours": "24/7, 365 days a year"
      }
    ]
  }
}
```

**Analytics query params:** `?days=30` (max 90)

---

### Crisis Resources

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/crisis/resources` | Bearer token | List all UK crisis resources |

---

## UK Crisis Resources

| Organisation | Contact | Hours |
|-------------|---------|-------|
| Samaritans | 116 123 | 24/7 |
| Crisis Text Line | Text SHOUT to 85258 | 24/7 |
| Mind Infoline | 0300 123 3393 | Mon–Fri 9am–6pm |
| Papyrus HOPELINEUK | 0800 068 4141 | Mon–Fri 10am–10pm |
| NHS 111 | 111 (option 2) | 24/7 |

---

## Build Roadmap

| Week | Feature | Status |
|------|---------|--------|
| 1 | User authentication & profiles | Done |
| 2 | Mood tracking & crisis signposting | Done |
| 3 | Professional matching | Upcoming |
| 4 | Messaging system | Upcoming |
| 5 | Notifications & reminders | Upcoming |
| 6 | MVP polish & deployment | Upcoming |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | required |
| `JWT_SECRET` | Secret key for signing tokens (32+ chars) | required |
| `JWT_EXPIRES_IN` | Token expiry duration | `24h` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `UPLOAD_DIR` | Avatar upload directory | `./uploads` |
| `MAX_FILE_SIZE_MB` | Max avatar file size | `5` |

---

## If you are in crisis

If you are struggling, please reach out:

- **Samaritans:** 116 123 (free, 24/7)
- **Crisis Text Line:** Text SHOUT to 85258 (free, 24/7)
- **Emergency:** 999
