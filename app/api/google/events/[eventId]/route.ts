import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getGoogleCalendarEventHtmlLink } from "@/lib/google";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const { eventId } = await params;

  try {
    const eventLink = await getGoogleCalendarEventHtmlLink({
      userId: user.id,
      eventId,
    });

    if (!eventLink) {
      return NextResponse.redirect(new URL("/dashboard?google=error", request.url));
    }

    return NextResponse.redirect(eventLink);
  } catch {
    return NextResponse.redirect(new URL("/dashboard?google=error", request.url));
  }
}
