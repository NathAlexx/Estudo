import { NextResponse } from "next/server";
import { db } from "@/db";
import { planEntries } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = Number(searchParams.get("profileId"));
  if (!profileId) return NextResponse.json([]);

  const rows = await db
    .select()
    .from(planEntries)
    .where(eq(planEntries.profileId, profileId))
    .orderBy(asc(planEntries.dayOfWeek), asc(planEntries.startTime));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const profileId = Number(body.profileId);
  const dayOfWeek = Number(body.dayOfWeek);
  const startTime = String(body.startTime ?? "");
  if (!profileId || Number.isNaN(dayOfWeek) || !startTime) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const [created] = await db
    .insert(planEntries)
    .values({
      profileId,
      dayOfWeek,
      startTime,
      durationMinutes: Number(body.durationMinutes ?? 60),
      subjectId: body.subjectId ? Number(body.subjectId) : null,
      title: body.title ? String(body.title) : null,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
