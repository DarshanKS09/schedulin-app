import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { disconnectGoogleCalendar } from "@/lib/google";

export async function GET(request: Request) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  await disconnectGoogleCalendar(user.id);

  return NextResponse.redirect(new URL("/dashboard?google=disconnected", request.url));
}
