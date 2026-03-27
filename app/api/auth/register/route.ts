import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: body.email.toLowerCase() }, { username: body.username.toLowerCase() }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with that email or username already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        username: body.username.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    await setSessionCookie(token);

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
