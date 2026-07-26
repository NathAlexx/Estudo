import { NextResponse } from "next/server";
import { db } from "@/db";
import { flashcardErrors } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [updated] = await db
    .update(flashcardErrors)
    .set({
      partnerTip: body.partnerTip ? String(body.partnerTip) : null,
      tipAuthorId: body.tipAuthorId ? Number(body.tipAuthorId) : null,
    })
    .where(eq(flashcardErrors.id, Number(id)))
    .returning();
  return NextResponse.json(updated);
}
