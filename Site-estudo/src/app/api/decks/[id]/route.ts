import { NextResponse } from "next/server";
import { db } from "@/db";
import { flashcardDecks } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(flashcardDecks).where(eq(flashcardDecks.id, Number(id)));
  return NextResponse.json({ ok: true });
}
