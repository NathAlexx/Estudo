import { NextResponse } from "next/server";
import { db } from "@/db";
import { challenges, studySessions } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const challengeId = Number(id);

  if (body.status === "accepted") {
    const [updated] = await db
      .update(challenges)
      .set({ status: "accepted" })
      .where(eq(challenges.id, challengeId))
      .returning();
    return NextResponse.json(updated);
  }

  if (body.status === "check") {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, challengeId));
    if (!challenge) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const result = await db
      .select({ total: sql`COALESCE(SUM(${studySessions.durationMinutes}), 0)` })
      .from(studySessions)
      .where(
        and(
          eq(studySessions.profileId, challenge.challengedId),
          gte(studySessions.occurredAt, sql`${challenge.createdAt}::date`),
          sql`${studySessions.occurredAt}::date <= ${challenge.deadline}`
        )
      );

    const totalMinutes = Number(result[0]?.total ?? 0);
    const completed = totalMinutes >= challenge.targetMinutes;

    const [updated] = await db
      .update(challenges)
      .set({ status: completed ? "completed" : "failed" })
      .where(eq(challenges.id, challengeId))
      .returning();

    return NextResponse.json({ ...updated, totalMinutes, completed });
  }

  return NextResponse.json({ error: "Invalid status" }, { status: 400 });
}
