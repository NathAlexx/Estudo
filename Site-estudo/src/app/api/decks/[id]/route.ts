import { NextResponse } from "next/server";
import { db } from "@/db";
import { flashcardDecks } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const updates: Partial<typeof flashcardDecks.$inferInsert> = {};
  if (body.name !== undefined) updates.name = String(body.name);
  if (body.subjectId !== undefined) updates.subjectId = body.subjectId ? Number(body.subjectId) : null;

  const [updated] = await db
    .update(flashcardDecks)
    .set(updates)
    .where(eq(flashcardDecks.id, Number(id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Deck não encontrado" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(flashcardDecks).where(eq(flashcardDecks.id, Number(id)));
  return NextResponse.json({ ok: true });
}
