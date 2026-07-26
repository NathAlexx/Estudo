import { NextResponse } from "next/server";
import { db } from "@/db";
import { rewardRedemptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [updated] = await db
    .update(rewardRedemptions)
    .set({
      status: String(body.status),
      fulfilledAt: body.status === "fulfilled" ? new Date() : null,
    })
    .where(eq(rewardRedemptions.id, Number(id)))
    .returning();
  return NextResponse.json(updated);
}
