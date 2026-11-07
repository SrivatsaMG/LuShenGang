"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

interface ModerationResponse {
  error?: string;
  warning?: string;
}

function isModerationResponse(value: unknown): value is ModerationResponse {
  return typeof value === "object" && value !== null;
}

export function PhotoModerationControls({ photoId }: { photoId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function moderate(action: "approve" | "reject") {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(`/api/gallery/${encodeURIComponent(photoId)}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        setMessage(isModerationResponse(result) && typeof result.error === "string" ? result.error : "The review could not be saved.");
        return;
      }

      setMessage(isModerationResponse(result) && typeof result.warning === "string" ? result.warning : "Review saved.");
      router.refresh();
    } catch {
      setMessage("The review could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="moderation-controls">
      <button aria-label="Approve photo" className="moderation-approve" disabled={busy} onClick={() => moderate("approve")} type="button">
        <Check aria-hidden="true" size={14} /> Approve
      </button>
      <button aria-label="Reject photo" className="moderation-reject" disabled={busy} onClick={() => moderate("reject")} type="button">
        <X aria-hidden="true" size={14} /> Reject
      </button>
      {message && <span aria-live="polite" className="moderation-message">{message}</span>}
    </div>
  );
}
