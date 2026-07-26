import { NextResponse } from "next/server";
import { db } from "@/db";
import { flashcards } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deckId = Number(searchParams.get("deckId"));
  if (!deckId) return NextResponse.json([]);

  const rows = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.deckId, deckId))
    .orderBy(asc(flashcards.id));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const deckId = Number(body.deckId);
  const front = String(body.front ?? "").trim();
  const back = String(body.back ?? "").trim();
  if (!deckId || !front || !back) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const [created] = await db
    .insert(flashcards)
    .values({ deckId, front, back })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
