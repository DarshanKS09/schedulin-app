import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_-]+$/i, "Username can only contain letters, numbers, underscores, and hyphens."),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const availabilityItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});

export const availabilitySchema = z.object({
  availability: z.array(availabilityItemSchema).max(50),
});

export const bookingSchema = z.object({
  username: z.string().min(3).max(30),
  guestName: z.string().min(2).max(80),
  guestEmail: z.string().email(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});
