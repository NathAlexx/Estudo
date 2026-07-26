import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupleStreaks, studySessions } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId1 = Number(searchParams.get("profileId1"));
  const profileId2 = Number(searchParams.get("profileId2"));
  if (!profileId1 || !profileId2) {
    return NextResponse.json({ currentStreak: 0, longestStreak: 0, bothStudiedToday: false });
  }

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const sessionsToday = await db
    .select({ profileId: studySessions.profileId })
    .from(studySessions)
    .where(
      and(
        gte(studySessions.occurredAt, sql`${today}::date`),
        sql`${studySessions.profileId} IN (${profileId1}, ${profileId2})`
      )
    )
    .groupBy(studySessions.profileId);

  const bothStudiedToday = sessionsToday.length === 2;

  let [streak] = await db
    .select()
    .from(coupleStreaks)
    .where(
      and(
        eq(coupleStreaks.profileId1, Math.min(profileId1, profileId2)),
        eq(coupleStreaks.profileId2, Math.max(profileId1, profileId2))
      )
    );

  if (!streak) {
    [streak] = await db
      .insert(coupleStreaks)
      .values({
        profileId1: Math.min(profileId1, profileId2),
        profileId2: Math.max(profileId1, profileId2),
      })
      .returning();
  }

  let newCurrent = streak.currentStreak;
  let newLongest = streak.longestStreak;
  let newLastDate = streak.lastStudiedTogether;

  if (bothStudiedToday) {
    if (streak.lastStudiedTogether === yesterday) {
      newCurrent += 1;
    } else if (streak.lastStudiedTogether !== today) {
      newCurrent = 1;
    }
    newLastDate = today;
    if (newCurrent > newLongest) newLongest = newCurrent;
  } else if (streak.lastStudiedTogether && streak.lastStudiedTogether < yesterday) {
    newCurrent = 0;
  }

  if (
    newCurrent !== streak.currentStreak ||
    newLongest !== streak.longestStreak ||
    newLastDate !== streak.lastStudiedTogether
  ) {
    [streak] = await db
      .update(coupleStreaks)
      .set({ currentStreak: newCurrent, longestStreak: newLongest, lastStudiedTogether: newLastDate })
      .where(eq(coupleStreaks.id, streak.id))
      .returning();
  }

  return NextResponse.json({
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    bothStudiedToday,
  });
}
