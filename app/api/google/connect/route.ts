import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/google";

export async function GET() {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = getGoogleAuthUrl();
  return NextResponse.redirect(url);
}
