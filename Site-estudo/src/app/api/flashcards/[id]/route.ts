import { NextResponse } from "next/server";
import { db } from "@/db";
import { flashcards } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cardId = Number(id);
  const body = await req.json();

  const updates: Partial<typeof flashcards.$inferInsert> = {};
  if (body.front !== undefined) updates.front = String(body.front);
  if (body.back !== undefined) updates.back = String(body.back);

  const [updated] = await db
    .update(flashcards)
    .set(updates)
    .where(eq(flashcards.id, cardId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Card não encontrado" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(flashcards).where(eq(flashcards.id, Number(id)));
  return NextResponse.json({ ok: true });
}
