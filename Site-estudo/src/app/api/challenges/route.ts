import { NextResponse } from "next/server";
import { db } from "@/db";
import { challenges } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = Number(searchParams.get("profileId"));
  if (!profileId) return NextResponse.json([]);

  const rows = await db
    .select()
    .from(challenges)
    .where(or(eq(challenges.challengerId, profileId), eq(challenges.challengedId, profileId)))
    .orderBy(challenges.createdAt);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [created] = await db
    .insert(challenges)
    .values({
      challengerId: Number(body.challengerId),
      challengedId: Number(body.challengedId),
      description: String(body.description),
      targetMinutes: Number(body.targetMinutes),
      subjectId: body.subjectId ? Number(body.subjectId) : null,
      deadline: String(body.deadline),
      points: Number(body.points ?? 10),
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
