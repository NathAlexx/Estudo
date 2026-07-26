import { NextResponse } from "next/server";
import { db } from "@/db";
import { flashcardDecks, flashcards } from "@/db/schema";
import { asc, eq, inArray, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = Number(searchParams.get("profileId"));
  if (!profileId) return NextResponse.json([]);

  const decks = await db
    .select()
    .from(flashcardDecks)
    .where(eq(flashcardDecks.profileId, profileId))
    .orderBy(asc(flashcardDecks.id));

  const deckIds = decks.map((d) => d.id);
  const countMap = new Map<number, { total: number; due: number }>();

  if (deckIds.length > 0) {
    const counts = await db
      .select({
        deckId: flashcards.deckId,
        total: sql<number>`count(*)::int`,
        due: sql<number>`count(*) filter (where ${flashcards.nextReviewAt} <= now())::int`,
      })
      .from(flashcards)
      .where(inArray(flashcards.deckId, deckIds))
      .groupBy(flashcards.deckId);

    for (const c of counts) {
      countMap.set(c.deckId, { total: c.total, due: c.due });
    }
  }

  const result = decks.map((deck) => ({
    ...deck,
    totalCards: countMap.get(deck.id)?.total ?? 0,
    dueCards: countMap.get(deck.id)?.due ?? 0,
  }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();
  const profileId = Number(body.profileId);
  const name = String(body.name ?? "").trim();
  if (!profileId || !name) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const [created] = await db
    .insert(flashcardDecks)
    .values({
      profileId,
      name,
      subjectId: body.subjectId ? Number(body.subjectId) : null,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
