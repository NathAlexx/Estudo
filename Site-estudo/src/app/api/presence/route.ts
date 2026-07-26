import { NextResponse } from "next/server";
import { db } from "@/db";
import { studyPresence } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = Number(searchParams.get("profileId"));
  if (!profileId) return NextResponse.json({ isOnline: false, isFocusing: false });

  const [presence] = await db.select().from(studyPresence).where(eq(studyPresence.profileId, profileId));
  return NextResponse.json(presence ?? { isOnline: false, isFocusing: false });
}

export async function POST(req: Request) {
  const body = await req.json();
  const profileId = Number(body.profileId);

  const [existing] = await db.select().from(studyPresence).where(eq(studyPresence.profileId, profileId));

  const data = {
    isOnline: Boolean(body.isOnline),
    isFocusing: Boolean(body.isFocusing),
    focusStartedAt: body.focusStartedAt ? new Date(body.focusStartedAt) : null,
    focusDuration: body.focusDuration ? Number(body.focusDuration) : null,
    updatedAt: new Date(),
  };

  if (existing) {
    const [updated] = await db.update(studyPresence).set(data).where(eq(studyPresence.id, existing.id)).returning();
    return NextResponse.json(updated);
  }

  const [created] = await db.insert(studyPresence).values({ profileId, ...data }).returning();
  return NextResponse.json(created, { status: 201 });
}
