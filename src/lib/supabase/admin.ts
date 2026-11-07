import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database";

export const DEFAULT_GALLERY_BUCKET = "gang-gallery";

export function getGallerySetupIssues(): string[] {
  const issues: string[] = [];
  const url = process.env.SUPABASE_URL;
  if (!url) {
    issues.push("Set SUPABASE_URL.");
  } else {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
        issues.push("Set SUPABASE_URL to an HTTPS URL (HTTP is allowed for localhost).");
      }
    } catch {
      issues.push("Set SUPABASE_URL to a valid HTTP or HTTPS URL.");
    }
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) issues.push("Set SUPABASE_SERVICE_ROLE_KEY.");
  return issues;
}

export function isGalleryStorageConfigured(): boolean {
  return getGallerySetupIssues().length === 0;
}

export function getGalleryBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || DEFAULT_GALLERY_BUCKET;
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Gallery storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("SUPABASE_URL must be a valid HTTP or HTTPS URL.");
  }
  if (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost" && parsedUrl.hostname !== "127.0.0.1") {
    throw new Error("SUPABASE_URL must use HTTPS except for a local development server.");
  }

  return createClient<Database>(parsedUrl.toString(), serviceKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
