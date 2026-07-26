import { NextResponse } from "next/server";
import { db } from "@/db";
import { rewardRedemptions, rewards, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = Number(searchParams.get("profileId"));
  if (!profileId) return NextResponse.json([]);

  const rows = await db
    .select({
      id: rewardRedemptions.id,
      status: rewardRedemptions.status,
      createdAt: rewardRedemptions.createdAt,
      fulfilledAt: rewardRedemptions.fulfilledAt,
      reward: {
        id: rewards.id,
        title: rewards.title,
        icon: rewards.icon,
        pointsCost: rewards.pointsCost,
      },
      claimer: {
        id: profiles.id,
        name: profiles.name,
        emoji: profiles.emoji,
      },
    })
    .from(rewardRedemptions)
    .innerJoin(rewards, eq(rewardRedemptions.rewardId, rewards.id))
    .innerJoin(profiles, eq(rewardRedemptions.profileId, profiles.id))
    .where(eq(rewardRedemptions.profileId, profileId))
    .orderBy(desc(rewardRedemptions.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [created] = await db
    .insert(rewardRedemptions)
    .values({
      rewardId: Number(body.rewardId),
      profileId: Number(body.profileId),
      status: "pending",
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
