import { NextResponse } from "next/server";
import { db } from "@/db";
import { profilePoints } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = Number(searchParams.get("profileId"));
  if (!profileId) return NextResponse.json({ totalPoints: 0, spentPoints: 0, availablePoints: 0 });

  const [points] = await db
    .select()
    .from(profilePoints)
    .where(eq(profilePoints.profileId, profileId));

  if (!points) {
    const [created] = await db
      .insert(profilePoints)
      .values({ profileId, totalPoints: 0, spentPoints: 0 })
      .returning();
    return NextResponse.json({ ...created, availablePoints: 0 });
  }

  return NextResponse.json({
    ...points,
    availablePoints: points.totalPoints - points.spentPoints,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const profileId = Number(body.profileId);
  const amount = Number(body.amount);

  const [existing] = await db
    .select()
    .from(profilePoints)
    .where(eq(profilePoints.profileId, profileId));

  if (existing) {
    const [updated] = await db
      .update(profilePoints)
      .set({
        totalPoints: existing.totalPoints + amount,
        updatedAt: new Date(),
      })
      .where(eq(profilePoints.id, existing.id))
      .returning();
    return NextResponse.json({ ...updated, availablePoints: updated.totalPoints - updated.spentPoints });
  } else {
    const [created] = await db
      .insert(profilePoints)
      .values({ profileId, totalPoints: Math.max(0, amount), spentPoints: 0 })
      .returning();
    return NextResponse.json({ ...created, availablePoints: created.totalPoints });
  }
}
