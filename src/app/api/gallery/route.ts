import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DiscordApiError } from "@/lib/discord/client";
import { getAuthorizationForUser, type AuthorizationResult } from "@/lib/permissions/authorization";
import { getGalleryBucketName, getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PhotoMimeType } from "@/lib/supabase/database";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const UPLOADS_PER_HOUR = 5;

const supportedImageTypes: Record<PhotoMimeType, { extension: string; signature: number[] }> = {
  "image/jpeg": { extension: "jpg", signature: [0xff, 0xd8, 0xff] },
  "image/png": { extension: "png", signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  "image/webp": { extension: "webp", signature: [0x52, 0x49, 0x46, 0x46] },
};

function isSupportedImage(type: string): type is PhotoMimeType {
  return Object.hasOwn(supportedImageTypes, type);
}

function hasExpectedSignature(bytes: Uint8Array, type: PhotoMimeType): boolean {
  const signature = supportedImageTypes[type].signature;
  if (!signature.every((byte, index) => bytes[index] === byte)) return false;
  return type !== "image/webp" || new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
}

function isDiscordSnowflake(userId: string): boolean {
  return /^\d{17,20}$/.test(userId);
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in with Discord before uploading." }, { status: 401 });
  }
  if (!isDiscordSnowflake(userId)) {
    return NextResponse.json({ error: "The Discord account could not be verified." }, { status: 401 });
  }

  let authorization: AuthorizationResult;
  try {
    authorization = await getAuthorizationForUser(userId);
  } catch (error) {
    if (!(error instanceof DiscordApiError)) throw error;
    console.error("Discord membership could not be verified for a gallery upload.", error);
    const retryAfter = error.retryAfterSeconds;
    return NextResponse.json(
      { error: error.status === 429 ? "Discord is rate limiting membership checks. Try again shortly." : "Discord membership verification is temporarily unavailable." },
      {
        status: 503,
        headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
      },
    );
  }
  if (!authorization.isGuildMember) {
    return NextResponse.json({ error: "Only current members of the configured Discord server can upload." }, { status: 403 });
  }

  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (!Number.isSafeInteger(contentLength) || contentLength < 0) {
      return NextResponse.json({ error: "Invalid upload request size." }, { status: 400 });
    }
    if (contentLength > MAX_FILE_SIZE + 128 * 1024) {
      return NextResponse.json({ error: "Images must be 8 MB or smaller." }, { status: 413 });
    }
  }

  const formData = await request.formData();
  const file = formData.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Images must be between 1 byte and 8 MB." }, { status: 413 });
  }
  if (!isSupportedImage(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 415 });
  }

  const fileBytes = new Uint8Array(await file.arrayBuffer());
  if (!hasExpectedSignature(fileBytes, file.type)) {
    return NextResponse.json({ error: "The image content does not match its file type." }, { status: 415 });
  }

  const supabase = getSupabaseAdmin();
  const bucket = getGalleryBucketName();
  const uploadedInLastHour = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("gallery_photos")
    .select("id", { count: "exact", head: true })
    .eq("discord_user_id", userId)
    .gte("created_at", uploadedInLastHour);

  if (countError) {
    console.error("Could not check the member photo upload limit.", countError);
    return NextResponse.json({ error: "Photo uploads are temporarily unavailable. Please try again later." }, { status: 503 });
  }
  if ((count ?? 0) >= UPLOADS_PER_HOUR) {
    return NextResponse.json({ error: "You have reached the limit of 5 photo uploads per hour." }, { status: 429 });
  }

  const image = supportedImageTypes[file.type];
  const objectPath = `${userId}/${randomUUID()}.${image.extension}`;
  const { error: storageError } = await supabase.storage.from(bucket).upload(objectPath, fileBytes, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (storageError) {
    console.error("Could not store a member gallery photo.", storageError);
    return NextResponse.json({ error: "The photo could not be stored. Please try again later." }, { status: 503 });
  }

  const { data: photo, error: insertError } = await supabase
    .from("gallery_photos")
    .insert({
      discord_user_id: userId,
      username: session.user.name || "Discord member",
      object_path: objectPath,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select("id,status,created_at")
    .single();

  if (insertError) {
    const { error: cleanupError } = await supabase.storage.from(bucket).remove([objectPath]);
    console.error("Could not save uploaded photo metadata.", insertError);
    if (cleanupError) {
      console.error("Could not remove the orphaned gallery image.", cleanupError);
    }
    return NextResponse.json({ error: "The photo could not be registered for review." }, { status: 503 });
  }

  return NextResponse.json(
    { photo: { id: photo.id, status: photo.status, createdAt: photo.created_at } },
    { status: 201 },
  );
}
