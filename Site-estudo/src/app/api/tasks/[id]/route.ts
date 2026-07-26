import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);
  const body = await req.json();

  const updates: Partial<typeof tasks.$inferInsert> = {};
  if (body.title !== undefined) updates.title = String(body.title);
  if (body.description !== undefined)
    updates.description = body.description ? String(body.description) : null;
  if (body.subjectId !== undefined)
    updates.subjectId = body.subjectId ? Number(body.subjectId) : null;
  if (body.dueDate !== undefined)
    updates.dueDate = body.dueDate ? String(body.dueDate) : null;
  if (body.priority !== undefined) updates.priority = String(body.priority);
  if (body.completed !== undefined) updates.completed = Boolean(body.completed);

  const [updated] = await db
    .update(tasks)
    .set(updates)
    .where(eq(tasks.id, taskId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);
  await db.delete(tasks).where(eq(tasks.id, taskId));
  return NextResponse.json({ ok: true });
}
