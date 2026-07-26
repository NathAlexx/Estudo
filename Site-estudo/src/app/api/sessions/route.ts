import { NextResponse } from "next/server";
import { db } from "@/db";
import { studySessions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = Number(searchParams.get("profileId"));
  if (!profileId) return NextResponse.json([]);

  const rows = await db
    .select()
    .from(studySessions)
    .where(eq(studySessions.profileId, profileId))
    .orderBy(desc(studySessions.occurredAt))
    .limit(200);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const profileId = Number(body.profileId);
  const durationMinutes = Number(body.durationMinutes);
  if (!profileId || !durationMinutes || durationMinutes <= 0) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const [created] = await db
    .insert(studySessions)
    .values({
      profileId,
      subjectId: body.subjectId ? Number(body.subjectId) : null,
      durationMinutes,
      technique: body.technique ? String(body.technique) : "pomodoro",
      notes: body.notes ? String(body.notes) : null,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
