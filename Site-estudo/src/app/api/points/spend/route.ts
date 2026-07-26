import { NextResponse } from "next/server";
import { db } from "@/db";
import { profilePoints } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const profileId = Number(body.profileId);
  const amount = Number(body.amount);

  const [points] = await db
    .select()
    .from(profilePoints)
    .where(eq(profilePoints.profileId, profileId));

  if (!points || points.totalPoints - points.spentPoints < amount) {
    return NextResponse.json({ error: "Pontos insuficientes" }, { status: 400 });
  }

  const [updated] = await db
    .update(profilePoints)
    .set({
      spentPoints: points.spentPoints + amount,
      updatedAt: new Date(),
    })
    .where(eq(profilePoints.id, points.id))
    .returning();

  return NextResponse.json({
    ...updated,
    availablePoints: updated.totalPoints - updated.spentPoints,
  });
}
