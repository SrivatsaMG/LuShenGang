import Link from "next/link";
import { signOut } from "@/auth";
import { BrandMark } from "@/components/brand-mark";
import { DiscordMark } from "@/components/discord-mark";

export default async function UnauthorizedPage() {
  return (
    <main className="auth-shell">
      <section aria-label="Los Santos city artwork" className="auth-art">
        <div className="auth-art-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> LU SHEN GANG · MEMBER PORTAL</p>
          <h1>YOUR STORY<br />IS YOURS.</h1>
          <p>Dashboard access is reserved for authorized gang management roles. Guild members can still share photos in the community gallery.</p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="denied-card">
          <Link aria-label="LU SHEN GANG home" className="brand-lockup" href="/">
            <BrandMark />
            <span><strong>LU SHEN</strong><small>LOS SANTOS · EST. 2024</small></span>
          </Link>
          <h1>Access unavailable</h1>
          <p>Your Discord account does not have an administrative dashboard role. As a guild member, you can still browse approved photos and submit your own for review.</p>
          <Link className="button button-red" href="/gallery">
            <DiscordMark /> Open community gallery
          </Link>
          <Link className="button button-outline" href="/">
            <DiscordMark /> Return to the public site
          </Link>
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}>
            <button className="auth-back" type="submit">Sign out of Discord</button>
          </form>
        </div>
      </section>
    </main>
  );
}
