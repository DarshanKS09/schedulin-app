import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_DURATION_MINUTES,
  SESSION_DURATION_SECONDS,
  SESSION_EXPIRY_COOKIE,
  SESSION_EXPIRY_NOTICE_SECONDS,
  getSessionExpiryTimestamp,
} from "@/lib/session";
const encoder = new TextEncoder();

type SessionPayload = {
  sub: string;
  email: string;
  username: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return encoder.encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_MINUTES}m`)
    .sign(getJwtSecret());
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  const expiresAt = getSessionExpiryTimestamp();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: SESSION_DURATION_SECONDS,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  cookieStore.set(SESSION_EXPIRY_COOKIE, String(expiresAt), {
    httpOnly: false,
    maxAge: SESSION_EXPIRY_NOTICE_SECONDS,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(SESSION_EXPIRY_COOKIE);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload as SessionPayload;
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireUser() {
  const session = await getSessionFromCookies();

  if (!session?.sub) {
    return null;
  }

  return db.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      googleCalendarId: true,
      googleRefreshToken: true,
    },
  });
}
