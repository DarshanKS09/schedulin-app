import { google } from "googleapis";

import { db } from "@/lib/db";
import { getBaseUrl } from "@/lib/utils";

export function getGoogleRedirectUri() {
  return process.env.GOOGLE_REDIRECT_URI ?? `${getBaseUrl()}/api/google/callback`;
}

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = getGoogleRedirectUri();

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGoogleAuthUrl(state?: string) {
  const client = getOAuthClient();

  return client.generateAuthUrl({
    access_type: "offline",
    include_granted_scopes: false,
    // Ask for account selection and consent so Google returns a refresh token
    // reliably for the saved Calendar connection.
    prompt: "consent select_account",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state,
  });
}

export async function exchangeGoogleCodeForTokens(code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function saveGoogleTokensForUser(userId: string, tokens: Awaited<ReturnType<typeof exchangeGoogleCodeForTokens>>) {
  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      googleRefreshToken: true,
    },
  });

  const nextRefreshToken = tokens.refresh_token ?? existingUser?.googleRefreshToken ?? null;

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      googleAccessToken: tokens.access_token ?? undefined,
      googleRefreshToken: nextRefreshToken,
      googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      googleCalendarId: nextRefreshToken ? "primary" : null,
    },
    select: {
      googleRefreshToken: true,
    },
  });

  return Boolean(updatedUser.googleRefreshToken);
}

export async function disconnectGoogleCalendar(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: {
      googleAccessToken: null,
      googleRefreshToken: null,
      googleTokenExpiry: null,
      googleCalendarId: null,
    },
  });
}

async function getAuthorizedClientForUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      googleAccessToken: true,
      googleRefreshToken: true,
      googleTokenExpiry: true,
    },
  });

  if (!user?.googleRefreshToken) {
    return null;
  }

  const client = getOAuthClient();
  client.setCredentials({
    access_token: user.googleAccessToken ?? undefined,
    refresh_token: user.googleRefreshToken,
    expiry_date: user.googleTokenExpiry?.getTime(),
  });

  if (!user.googleAccessToken || (user.googleTokenExpiry && user.googleTokenExpiry <= new Date())) {
    const refreshed = await client.refreshAccessToken();
    const credentials = refreshed.credentials;

    await db.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: credentials.access_token ?? undefined,
        googleTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
      },
    });

    client.setCredentials(credentials);
  }

  return client;
}

export async function createGoogleCalendarEvent({
  userId,
  calendarId,
  summary,
  description,
  startTime,
  endTime,
  attendeeEmail,
}: {
  userId: string;
  calendarId?: string | null;
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  attendeeEmail: string;
}) {
  const auth = await getAuthorizedClientForUser(userId);

  if (!auth) {
    return null;
  }

  const calendar = google.calendar({ version: "v3", auth });
  const event = await calendar.events.insert({
    calendarId: calendarId || "primary",
    requestBody: {
      summary,
      description,
      start: {
        dateTime: startTime,
        timeZone: "UTC",
      },
      end: {
        dateTime: endTime,
        timeZone: "UTC",
      },
      attendees: [{ email: attendeeEmail }],
    },
  });

  return event.data.id ?? null;
}

export async function getGoogleCalendarEventHtmlLink({
  userId,
  eventId,
}: {
  userId: string;
  eventId: string;
}) {
  const auth = await getAuthorizedClientForUser(userId);

  if (!auth) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      googleCalendarId: true,
    },
  });

  const calendar = google.calendar({ version: "v3", auth });
  const event = await calendar.events.get({
    calendarId: user?.googleCalendarId || "primary",
    eventId,
  });

  return event.data.htmlLink ?? null;
}
