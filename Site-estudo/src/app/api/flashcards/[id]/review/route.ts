import { NextResponse } from "next/server";
import { db } from "@/db";
import { flashcards } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const INTERVAL_DAYS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 14,
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cardId = Number(id);
  const body = await req.json();
  const result = String(body.result ?? "good") as "again" | "good" | "easy";

  const [card] = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.id, cardId));

  if (!card) {
    return NextResponse.json({ error: "Card não encontrado" }, { status: 404 });
  }

  let nextBox = card.box;
  if (result === "again") nextBox = 1;
  else if (result === "good") nextBox = Math.min(card.box + 1, 5);
  else if (result === "easy") nextBox = Math.min(card.box + 2, 5);

  const days = INTERVAL_DAYS[nextBox] ?? 0;
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + days);
  if (days === 0) {
    nextReviewAt.setMinutes(nextReviewAt.getMinutes() + 10);
  }

  const [updated] = await db
    .update(flashcards)
    .set({
      box: nextBox,
      timesReviewed: card.timesReviewed + 1,
      lastReviewedAt: new Date(),
      nextReviewAt,
    })
    .where(eq(flashcards.id, cardId))
    .returning();

  return NextResponse.json(updated);
}
