import { NextResponse } from "next/server";
import { db } from "@/db";
import { flashcardDecks, flashcards } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const partnerProfileId = Number(searchParams.get("partnerProfileId"));
  const limit = Number(searchParams.get("limit") ?? "5");
  if (!partnerProfileId) return NextResponse.json([]);

  const rows = await db
    .select({
      id: flashcards.id,
      front: flashcards.front,
      back: flashcards.back,
      deckName: flashcardDecks.name,
    })
    .from(flashcards)
    .innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
    .where(eq(flashcardDecks.profileId, partnerProfileId))
    .orderBy(sql`RANDOM()`)
    .limit(limit);

  return NextResponse.json(rows);
}
