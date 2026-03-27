import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionFromCookies } from "@/lib/auth";
import { exchangeGoogleCodeForTokens, saveGoogleTokensForUser } from "@/lib/google";

const GOOGLE_OAUTH_STATE_COOKIE = "echo_google_oauth_state";

export async function GET(request: Request) {
  const session = await getSessionFromCookies();

  if (!session?.sub) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  cookieStore.delete(GOOGLE_OAUTH_STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/dashboard?google=error", request.url));
  }

  try {
    const tokens = await exchangeGoogleCodeForTokens(code);
    await saveGoogleTokensForUser(session.sub, tokens);
    return NextResponse.redirect(new URL("/dashboard?google=connected", request.url));
  } catch {
    return NextResponse.redirect(new URL("/dashboard?google=error", request.url));
  }
}
