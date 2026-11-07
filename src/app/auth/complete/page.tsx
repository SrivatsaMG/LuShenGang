import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { getAuthorizationForUser } from "@/lib/permissions/authorization";

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

  const authorization = await getAuthorizationForUser(session.user.id);
  if (!authorization.isGuildMember) redirect("/unauthorized");
  if (authorization.permissions.includes("dashboard:read")) {
    redirect("/dashboard");
  }
  redirect("/gallery");
  return null;
}
