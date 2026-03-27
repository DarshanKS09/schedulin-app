import { NextResponse } from "next/server";

import { getSessionFromCookies } from "@/lib/auth";
import { exchangeGoogleCodeForTokens, saveGoogleTokensForUser } from "@/lib/google";

export async function GET(request: Request) {
  const session = await getSessionFromCookies();

  if (!session?.sub) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
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
