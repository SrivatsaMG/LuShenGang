"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Upload } from "lucide-react";

interface ApiMessage {
  error?: string;
  photo?: { id: string; status: string };
}

function isApiMessage(value: unknown): value is ApiMessage {
  return typeof value === "object" && value !== null;
}

export function PhotoUploadForm({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submitPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        body: new FormData(form),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        setMessage(isApiMessage(result) && typeof result.error === "string" ? result.error : "The photo could not be uploaded.");
        return;
      }

      form.reset();
      setMessage("Photo submitted. It will appear in the gallery after management review.");
      router.refresh();
    } catch {
      setMessage("The upload could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="gallery-upload-form" onSubmit={submitPhoto}>
      <label className="gallery-file-label" htmlFor="gallery-photo">
        <ImagePlus aria-hidden="true" size={18} />
        <span><strong>Choose a photo</strong><small>JPG, PNG, or WebP · up to 8 MB</small></span>
        <input
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || busy}
          id="gallery-photo"
          name="photo"
          required
          type="file"
        />
      </label>
      <button className="button button-red gallery-submit" disabled={disabled || busy} type="submit">
        <Upload aria-hidden="true" size={14} /> {busy ? "Uploading…" : "Submit for review"}
      </button>
      {message && <p aria-live="polite" className="gallery-form-message">{message}</p>}
    </form>
  );
}
