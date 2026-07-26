import { NextResponse } from "next/server";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const subjectId = Number(id);
  const body = await req.json();

  const updates: Partial<typeof subjects.$inferInsert> = {};
  if (body.name !== undefined) updates.name = String(body.name);
  if (body.emoji !== undefined) updates.emoji = String(body.emoji);
  if (body.colorHex !== undefined) updates.colorHex = String(body.colorHex);

  const [updated] = await db
    .update(subjects)
    .set(updates)
    .where(eq(subjects.id, subjectId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Matéria não encontrada" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const subjectId = Number(id);
  await db.delete(subjects).where(eq(subjects.id, subjectId));
  return NextResponse.json({ ok: true });
}
