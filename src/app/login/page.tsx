import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
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
  discord_network_error: "The website could not connect to Discord to verify your membership. Please try again; if it continues, the site administrator should check Vercel function logs for a network timeout or connection error.",
  discord_api_unavailable: "Discord's API returned a server error while checking membership. Please try again shortly; the site administrator should check the Vercel function logs.",
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
  const discordApiStatus = error?.match(/^discord_api_(\d{3})$/)?.[1];
  const configured = isDiscordLoginConfigured();

  return (
    <main className="auth-shell">
      <div aria-hidden="true" className="auth-backdrop" />
      <header className="auth-header">
        <Link aria-label="LU SHEN GANG home" className="brand-lockup auth-brand" href="/">
          <BrandMark />
          <span><strong>LU SHEN</strong><small>LOS SANTOS · EST. 2024</small></span>
        </Link>
        <span className="auth-header-label"><span /> PRIVATE COMMUNITY</span>
      </header>
      <section aria-labelledby="login-title" className="auth-content">
        <div className="auth-card">
          <p className="eyebrow"><span className="eyebrow-line" /> MEMBER PORTAL</p>
          <h1 id="login-title">Your crew<br />is waiting.</h1>
          <p className="auth-intro">Sign in with Discord to step back into Los Santos and connect with your gang.</p>
          {error && (
            <p className="auth-error" role="alert">
              {errorMessages[error] ?? (discordApiStatus
                ? `Discord returned HTTP ${discordApiStatus} while checking your server membership. The site administrator should verify the guild ID and check the Vercel function logs.`
                : "Sign-in failed. Please try again or contact a server administrator.")}
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
          <div className="auth-divider"><span /> MEMBER ACCESS <span /></div>
          <p className="auth-note"><ShieldCheck aria-hidden="true" size={14} /> Membership is verified securely with Discord.</p>
        </div>
      </section>
      <footer className="auth-footer">
        <span><LockKeyhole aria-hidden="true" size={12} /> Your Discord password is never shared with us.</span>
        <Link className="auth-back" href="/"><ArrowLeft aria-hidden="true" size={14} /> Back to the public site</Link>
      </footer>
    </main>
  );
}
