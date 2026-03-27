# Echo Scheduler

Echo Scheduler is a production-ready scheduling platform built with Next.js App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, JWT authentication in HTTP-only cookies, Google Calendar integration, and an OpenAI-powered meeting description feature.

## Features

- User registration and login with bcrypt password hashing
- JWT sessions stored in HTTP-only cookies
- Protected dashboard routes with middleware
- Public booking page at `/book/[username]`
- Weekly availability management
- UTC-first booking storage with client-side timezone formatting
- Double-booking protection with serializable booking transactions
- Google Calendar event creation after successful booking
- OpenAI-generated meeting descriptions with a safe fallback when no API key is present

## Project structure

```text
app/
  api/
    auth/
    availability/
    booking/
    google/
  auth/
  availability/
  booking/
  book/[username]/
  dashboard/
components/
lib/
prisma/
```

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/echo_scheduler?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google/callback"

OPENAI_API_KEY=""
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create the database and generate Prisma Client:

```bash
npm run prisma:migrate -- --name init
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Google Calendar setup

1. Create a Google Cloud project.
2. Enable the Google Calendar API.
3. Create OAuth credentials of type `Web application`.
4. Add `http://localhost:3000/api/google/callback` as an authorized redirect URI for local development.
5. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in `.env`.
6. Sign in, open the dashboard, and click `Connect Google Calendar`.

After connecting, new bookings will create events in the host user&apos;s primary Google Calendar.

## Deployment on Vercel

1. Create a PostgreSQL database for production.
2. Add all environment variables in the Vercel project settings.
3. Set `NEXT_PUBLIC_APP_URL` and `GOOGLE_REDIRECT_URI` to your production domain.
4. Run Prisma migrations during deployment:

```bash
npx prisma migrate deploy
```

5. Deploy the project to Vercel.

## API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/availability`
- `POST /api/availability`
- `GET /api/booking/slots?username=alice`
- `POST /api/booking`
- `GET /api/google/connect`
- `GET /api/google/callback`

## Notes

- All booking times are stored in UTC.
- The frontend displays times in the viewer&apos;s local timezone using `Intl.DateTimeFormat`.
- If `OPENAI_API_KEY` is missing, booking descriptions fall back to a deterministic template.
