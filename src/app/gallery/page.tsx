import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowLeft, ImagePlus, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { BrandMark } from "@/components/brand-mark";
import { PhotoModerationControls } from "@/components/gallery/photo-moderation-controls";
import { PhotoUploadForm } from "@/components/gallery/photo-upload-form";
import { getAuthorizationForUser } from "@/lib/permissions/authorization";
import {
  getGalleryBucketName,
  getGallerySetupIssues,
  getSupabaseAdmin,
  isGalleryStorageConfigured,
} from "@/lib/supabase/admin";
import type { GalleryPhotoRow } from "@/lib/supabase/database";

export const metadata: Metadata = { title: "Community Gallery" };

interface DisplayPhoto extends GalleryPhotoRow {
  signedUrl: string;
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<main className="gallery-loading">Opening the member gallery…</main>}>
      <GalleryContent />
    </Suspense>
  );
}

async function GalleryContent() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fgallery");

  const authorization = await getAuthorizationForUser(session.user.id);
  if (!authorization.isGuildMember) redirect("/unauthorized");

  const canModerate = authorization.permissions.includes("community:manage");
  const storageConfigured = isGalleryStorageConfigured();
  const setupIssues = getGallerySetupIssues();
  let approvedPhotos: DisplayPhoto[] = [];
  let pendingPhotos: DisplayPhoto[] = [];

  if (storageConfigured) {
    const supabase = getSupabaseAdmin();
    const { data: approvedRows, error: approvedError } = await supabase
      .from("gallery_photos")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(60);

    if (approvedError) throw new Error("Approved community photos could not be loaded.");
    approvedPhotos = await createSignedPhotos(approvedRows);

    const pendingQuery = supabase
      .from("gallery_photos")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(60);
    const { data: pendingRows, error: pendingError } = canModerate
      ? await pendingQuery
      : await pendingQuery.eq("discord_user_id", session.user.id);

    if (pendingError) throw new Error("Pending community photos could not be loaded.");
    pendingPhotos = await createSignedPhotos(pendingRows);
  }

  const displayName = session.user.name || "Discord member";

  return (
    <main className="gallery-page">
      <header className="gallery-header">
        <Link aria-label="LU SHEN GANG home" className="brand-lockup" href="/">
          <BrandMark />
          <span><strong>LU SHEN</strong><small>MEMBER GALLERY</small></span>
        </Link>
        <div className="gallery-header-actions">
          <span className="gallery-member-name">{displayName}</span>
          <Link className="button button-outline button-small" href={canModerate ? "/dashboard" : "/"}><ArrowLeft aria-hidden="true" size={13} /> {canModerate ? "Dashboard" : "Home"}</Link>
        </div>
      </header>

      <div className="gallery-main">
        <section className="gallery-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-line" /> LU SHEN GANG · SHARED MOMENTS</p>
            <h1>Community <span>gallery</span></h1>
            <p>Share a moment from the city. Member uploads are private until approved by gang management.</p>
          </div>
          <span className="gallery-visibility"><ShieldCheck aria-hidden="true" size={14} /> MEMBERS ONLY</span>
        </section>

        <section aria-labelledby="upload-title" className="gallery-upload-panel">
          <div className="gallery-upload-heading">
            <span className="gallery-upload-icon"><ImagePlus aria-hidden="true" size={17} /></span>
            <div><h2 id="upload-title">Share a photo</h2><p>Your photo will be reviewed before it is visible to other members.</p></div>
          </div>
          {storageConfigured ? (
            <PhotoUploadForm />
          ) : (
            <div className="gallery-setup-note" role="status">
              <strong>Photo storage setup required</strong>
              <p>An administrator needs to configure the Supabase gallery storage:</p>
              <ul>{setupIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
              <p>Run the SQL migration at <code>supabase/migrations/202611070001_gallery.sql</code> in the Supabase SQL editor.</p>
            </div>
          )}
        </section>

        {canModerate && pendingPhotos.length > 0 && (
          <section aria-labelledby="review-title" className="gallery-section">
            <div className="gallery-section-heading">
              <div><p className="eyebrow"><span className="eyebrow-line" /> MANAGEMENT</p><h2 id="review-title">Awaiting review <span>{pendingPhotos.length}</span></h2></div>
              <span className="gallery-section-note">Only management can approve photos</span>
            </div>
            <div className="gallery-grid">
              {pendingPhotos.map((photo) => <PhotoCard key={photo.id} canModerate photo={photo} />)}
            </div>
          </section>
        )}

        {!canModerate && pendingPhotos.length > 0 && (
          <section aria-labelledby="pending-title" className="gallery-pending-note">
            <span className="gallery-pending-dot" />
            <div><strong>{pendingPhotos.length} photo{pendingPhotos.length === 1 ? "" : "s"} awaiting review</strong><span>Your uploads will show up here once management approves them.</span></div>
          </section>
        )}

        <section aria-labelledby="approved-title" className="gallery-section">
          <div className="gallery-section-heading">
            <div><p className="eyebrow"><span className="eyebrow-line" /> FROM THE CREW</p><h2 id="approved-title">Shared moments</h2></div>
            <span className="gallery-section-note">Approved community photos</span>
          </div>
          {approvedPhotos.length > 0 ? (
            <div className="gallery-grid">
              {approvedPhotos.map((photo) => <PhotoCard key={photo.id} photo={photo} />)}
            </div>
          ) : (
            <div className="gallery-empty">
              <ImagePlus aria-hidden="true" size={22} />
              <strong>No approved photos yet</strong>
              <span>Be the first to share a moment with the crew.</span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

async function createSignedPhotos(rows: GalleryPhotoRow[]): Promise<DisplayPhoto[]> {
  const supabase = getSupabaseAdmin();
  const bucket = getGalleryBucketName();
  return Promise.all(rows.map(async (photo) => {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(photo.object_path, 60 * 30);
    if (error || !data?.signedUrl) {
      console.error("Could not create a private gallery image URL.", error);
      throw new Error("A community photo could not be loaded.");
    }
    return { ...photo, signedUrl: data.signedUrl };
  }));
}

function PhotoCard({ photo, canModerate = false }: { photo: DisplayPhoto; canModerate?: boolean }) {
  const createdAt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(photo.created_at));
  return (
    <article className="gallery-photo-card">
      <div className="gallery-photo-image">
        <Image alt={`Photo shared by ${photo.username}`} height={420} src={photo.signedUrl} unoptimized width={640} />
        {photo.status === "pending" && <span className="gallery-photo-pending">PENDING REVIEW</span>}
      </div>
      <div className="gallery-photo-meta">
        <div><strong>{photo.username}</strong><span>{createdAt}</span></div>
        {canModerate && photo.status === "pending" && <PhotoModerationControls photoId={photo.id} />}
      </div>
    </article>
  );
}
