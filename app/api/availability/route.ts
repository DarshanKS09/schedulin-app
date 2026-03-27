import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateAvailabilityRanges } from "@/lib/slots";
import { availabilitySchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const availability = await db.availability.findMany({
      where: { userId: user.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ availability });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = availabilitySchema.parse(await request.json());
    const validationError = validateAvailabilityRanges(
      body.availability.map((item) => ({
        ...item,
        id: "",
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await db.$transaction([
      db.availability.deleteMany({ where: { userId: user.id } }),
      db.availability.createMany({
        data: body.availability.map((item) => ({
          userId: user.id,
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
        })),
      }),
    ]);

    const availability = await db.availability.findMany({
      where: { userId: user.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ availability });
  } catch (error) {
    return handleApiError(error);
  }
}
