import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { getAuthorizationForUser, type AuthorizationResult } from "@/lib/permissions/authorization";
import { DiscordApiError } from "@/lib/discord/client";

export default function AuthCompletePage() {
  return (
    <Suspense fallback={<main className="auth-loading">Verifying Discord access…</main>}>
      <CompleteAuthentication />
    </Suspense>
  );
}

async function CompleteAuthentication() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let authorization: AuthorizationResult;
  try {
    authorization = await getAuthorizationForUser(session.user.id);
  } catch (error) {
    if (!(error instanceof DiscordApiError)) throw error;
    console.error("Discord membership could not be verified after sign-in.", {
      status: error.status,
      message: error.message,
      retryAfterSeconds: error.retryAfterSeconds,
    });
    redirect("/");
  }

  if (!authorization.isGuildMember) redirect("/");
  if (authorization.permissions.includes("dashboard:read")) {
    redirect("/dashboard");
  }
  redirect("/gallery");
  return null;
}
