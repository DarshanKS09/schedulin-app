import OpenAI from "openai";

type DescriptionInput = {
  hostName: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
};

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateMeetingDescription(input: DescriptionInput) {
  const fallback = [
    `Meeting between ${input.hostName} and ${input.guestName}.`,
    `Guest email: ${input.guestEmail}.`,
    `Scheduled from ${input.startTime} to ${input.endTime} UTC.`,
  ].join(" ");

  if (!client) {
    return fallback;
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You write concise, professional calendar event descriptions for scheduled meetings.",
        },
        {
          role: "user",
          content: `Host: ${input.hostName}
Guest: ${input.guestName}
Guest email: ${input.guestEmail}
Start: ${input.startTime} UTC
End: ${input.endTime} UTC

Write a short event description in 2-3 sentences.`,
        },
      ],
    });

    return response.output_text.trim() || fallback;
  } catch {
    return fallback;
  }
}
