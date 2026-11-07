import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DiscordApiError } from "@/lib/discord/client";
import { hasPermission } from "@/lib/permissions/authorization";
import { getGalleryBucketName, getSupabaseAdmin } from "@/lib/supabase/admin";

type ModerationAction = "approve" | "reject";

function isModerationAction(value: unknown): value is { action: ModerationAction } {
  if (typeof value !== "object" || value === null || !("action" in value)) return false;
  return value.action === "approve" || value.action === "reject";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in to review photos." }, { status: 401 });
  }
  let canManage: boolean;
  try {
    canManage = await hasPermission(userId, "community:manage");
  } catch (error) {
    if (!(error instanceof DiscordApiError)) throw error;
    console.error("Discord membership could not be verified for gallery moderation.", error);
    const retryAfter = error.retryAfterSeconds;
    return NextResponse.json(
      { error: error.status === 429 ? "Discord is rate limiting membership checks. Try again shortly." : "Discord membership verification is temporarily unavailable." },
      {
        status: 503,
        headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
      },
    );
  }
  if (!canManage) {
    return NextResponse.json({ error: "Management access is required to review photos." }, { status: 403 });
  }

  const { id } = await params;
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid photo ID." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Choose whether to approve or reject this photo." }, { status: 400 });
  }
  if (!isModerationAction(body)) {
    return NextResponse.json({ error: "Choose whether to approve or reject this photo." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const status = body.action === "approve" ? "approved" : "rejected";
  const { data: photo, error } = await supabase
    .from("gallery_photos")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("id,object_path,status")
    .maybeSingle();

  if (error) {
    console.error("Could not update gallery photo moderation status.", error);
    return NextResponse.json({ error: "The review could not be saved. Please try again later." }, { status: 503 });
  }
  if (!photo) {
    return NextResponse.json({ error: "This photo is no longer awaiting review." }, { status: 409 });
  }

  if (body.action === "reject") {
    const { error: removeError } = await supabase.storage.from(getGalleryBucketName()).remove([photo.object_path]);
    if (removeError) {
      console.error("Could not remove a rejected gallery image.", removeError);
      return NextResponse.json({
        photo: { id: photo.id, status: photo.status },
        warning: "The photo was rejected, but its private storage object could not be removed.",
      }, { status: 200 });
    }
  }

  return NextResponse.json({ photo: { id: photo.id, status: photo.status } });
}
