import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

import {
  SESSION_COOKIE,
  SESSION_EXPIRY_COOKIE,
  getSessionExpiredRedirectPath,
} from "@/lib/session";

const protectedPaths = ["/dashboard", "/api/availability", "/api/google/connect", "/api/google/disconnect", "/api/google/events"];
const encoder = new TextEncoder();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return encoder.encode(secret);
}

function hasExpiredSession(request: NextRequest) {
  const expiresAt = Number(request.cookies.get(SESSION_EXPIRY_COOKIE)?.value);
  return Number.isFinite(expiresAt) && Date.now() >= expiresAt;
}

function isDocumentRequest(request: NextRequest) {
  return request.method === "GET" && request.headers.get("sec-fetch-dest") === "document";
}

function clearSessionCookies(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(SESSION_EXPIRY_COOKIE);
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const expired = hasExpiredSession(request);

  if (!token) {
    if (pathname.startsWith("/api/")) {
      if (expired && isDocumentRequest(request)) {
        const response = NextResponse.redirect(new URL(getSessionExpiredRedirectPath(pathname), request.url));
        return clearSessionCookies(response);
      }

      const response = NextResponse.json(
        { error: expired ? "Session expired. Please log in again." : "Unauthorized", code: expired ? "SESSION_EXPIRED" : "UNAUTHORIZED" },
        { status: 401 },
      );
      return expired ? clearSessionCookies(response) : response;
    }

    if (expired) {
      const response = NextResponse.redirect(new URL(getSessionExpiredRedirectPath(pathname), request.url));
      return clearSessionCookies(response);
    }

    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, getJwtSecret());
  } catch {
    if (pathname.startsWith("/api/")) {
      if (isDocumentRequest(request)) {
        const response = NextResponse.redirect(new URL(getSessionExpiredRedirectPath(pathname), request.url));
        return clearSessionCookies(response);
      }

      const response = NextResponse.json({ error: "Session expired. Please log in again.", code: "SESSION_EXPIRED" }, { status: 401 });
      return clearSessionCookies(response);
    }

    const response = NextResponse.redirect(new URL(getSessionExpiredRedirectPath(pathname), request.url));
    return clearSessionCookies(response);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/availability/:path*", "/api/google/connect", "/api/google/disconnect", "/api/google/events/:path*"],
};
