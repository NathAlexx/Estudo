import { NextResponse } from "next/server";
import { db } from "@/db";
import { planEntries } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const updates: Partial<typeof planEntries.$inferInsert> = {};
  if (body.dayOfWeek !== undefined) updates.dayOfWeek = Number(body.dayOfWeek);
  if (body.startTime !== undefined) updates.startTime = String(body.startTime);
  if (body.durationMinutes !== undefined) updates.durationMinutes = Number(body.durationMinutes);
  if (body.subjectId !== undefined) updates.subjectId = body.subjectId ? Number(body.subjectId) : null;
  if (body.title !== undefined) updates.title = body.title ? String(body.title) : null;

  const [updated] = await db
    .update(planEntries)
    .set(updates)
    .where(eq(planEntries.id, Number(id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Bloco não encontrado" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(planEntries).where(eq(planEntries.id, Number(id)));
  return NextResponse.json({ ok: true });
}
