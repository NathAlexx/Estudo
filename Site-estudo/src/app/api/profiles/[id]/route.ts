import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profileId = Number(id);
  const body = await req.json();

  const updates: Partial<typeof profiles.$inferInsert> = {};
  if (body.name !== undefined) updates.name = String(body.name);
  if (body.emoji !== undefined) updates.emoji = String(body.emoji);
  if (body.colorHex !== undefined) updates.colorHex = String(body.colorHex);
  if (body.weeklyGoalMinutes !== undefined)
    updates.weeklyGoalMinutes = Number(body.weeklyGoalMinutes);

  const [updated] = await db
    .update(profiles)
    .set(updates)
    .where(eq(profiles.id, profileId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profileId = Number(id);
  await db.delete(profiles).where(eq(profiles.id, profileId));
  return NextResponse.json({ ok: true });
}
