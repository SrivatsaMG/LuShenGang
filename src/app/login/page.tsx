import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { DiscordMark } from "@/components/discord-mark";
import { loginWithDiscord } from "@/app/login/actions";
import { getDiscordLoginSetupIssues, isDiscordLoginConfigured } from "@/lib/auth/configuration";

export const metadata: Metadata = { title: "Member Login" };

const errorMessages: Record<string, string> = {
  AccessDenied: "This Discord account is not a member of the configured LU SHEN GANG server.",
  OAuthAccountNotLinked: "This Discord account could not be linked. Please use the account you originally signed in with.",
  OAuthCallbackError: "Discord sign-in could not be completed. Please try again.",
  OAuthSignin: "Discord could not start the sign-in flow. Please try again in a moment.",
  Configuration: "Discord login is not configured yet. Ask a site administrator to finish the setup.",
  discord_rate_limited: "Discord is rate limiting membership checks. Wait a moment, then try signing in again.",
  discord_bot_unauthorized: "Discord rejected the site's bot token. An administrator must reset DISCORD_BOT_TOKEN in Vercel and redeploy.",
  discord_bot_forbidden: "Discord refused the membership check. An administrator should confirm the bot is in the configured server and Server Members Intent is enabled in the Discord Developer Portal.",
  discord_verification_failed: "Discord membership verification is unavailable. An administrator should check the Vercel function logs and bot configuration.",
  invite_not_configured: "The public Discord invite has not been configured yet.",
};

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <Suspense fallback={<main className="auth-loading">Loading sign-in…</main>}>
      <LoginPageContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function LoginPageContent({
  searchParams,
}: { searchParams: PageProps<"/login">["searchParams"] }) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const configured = isDiscordLoginConfigured();

  return (
    <main className="auth-shell">
      <section aria-label="Los Santos city artwork" className="auth-art">
        <div className="auth-art-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> LU SHEN GANG · MEMBER PORTAL</p>
          <h1>THE CITY<br />IS YOURS.</h1>
          <p>Your crew. Your stories. Your home in Los Santos. Sign in with Discord to access the private community dashboard.</p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <Link aria-label="LU SHEN GANG home" className="brand-lockup auth-brand" href="/">
            <BrandMark />
            <span><strong>LU SHEN</strong><small>LOS SANTOS · EST. 2024</small></span>
          </Link>
          <p className="eyebrow"><span className="eyebrow-line" /> MEMBER ACCESS</p>
          <h2>Welcome back.</h2>
          <p className="auth-intro">Sign in with the Discord account connected to your gang membership.</p>
          {error && (
            <p className="auth-error" role="alert">
              {errorMessages[error] ?? "Sign-in failed. Please try again or contact a server administrator."}
            </p>
          )}
          {configured ? (
            <form action={loginWithDiscord}>
              <button className="discord-button" type="submit">
                <DiscordMark />
                Continue with Discord
              </button>
            </form>
          ) : (
            <div className="auth-config-note" role="status">
              <strong>Sign-in setup required</strong>
              <p>Discord login is unavailable until an administrator configures the server environment:</p>
              <ul>
                {getDiscordLoginSetupIssues().map((issue) => <li key={issue}>{issue}</li>)}
              </ul>
            </div>
          )}
          <p className="auth-note"><LockKeyhole aria-hidden="true" size={12} /> Your Discord credentials are handled by Discord. We never see your password.</p>
          <Link className="auth-back" href="/"><ArrowLeft aria-hidden="true" size={14} /> Back to the public site</Link>
        </div>
      </section>
    </main>
  );
}
