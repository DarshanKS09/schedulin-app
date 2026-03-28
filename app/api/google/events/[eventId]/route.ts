import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getGoogleCalendarEventHtmlLink } from "@/lib/google";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const requestUrl = new URL(request.url);
  const wantsJson =
    requestUrl.searchParams.get("format") === "json" ||
    request.headers.get("accept")?.includes("application/json");
  const user = await requireUser();

  if (!user) {
    if (wantsJson) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const { eventId } = await params;

  try {
    const eventLink = await getGoogleCalendarEventHtmlLink({
      userId: user.id,
      eventId,
    });

    if (!eventLink) {
      if (wantsJson) {
        return NextResponse.json({ error: "Calendar event not found." }, { status: 404 });
      }

      return NextResponse.redirect(new URL("/dashboard?google=error", request.url));
    }

    if (wantsJson) {
      return NextResponse.json({ url: eventLink });
    }

    return NextResponse.redirect(eventLink);
  } catch {
    if (wantsJson) {
      return NextResponse.json({ error: "Failed to open calendar event." }, { status: 500 });
    }

    return NextResponse.redirect(new URL("/dashboard?google=error", request.url));
  }
}
