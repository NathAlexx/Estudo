import { NextResponse } from "next/server";
import { db } from "@/db";
import { flashcardErrors } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profileId = Number(searchParams.get("profileId"));
  if (!profileId) return NextResponse.json([]);

  const rows = await db
    .select()
    .from(flashcardErrors)
    .where(eq(flashcardErrors.profileId, profileId))
    .orderBy(flashcardErrors.createdAt);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [created] = await db
    .insert(flashcardErrors)
    .values({
      flashcardId: Number(body.flashcardId),
      profileId: Number(body.profileId),
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
