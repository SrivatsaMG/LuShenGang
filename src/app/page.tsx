import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronRight,
  Clock3,
  MapPin,
  Radio,
  Shield,
  UsersRound,
} from "lucide-react";
import { DiscordMark } from "@/components/discord-mark";
import { BrandMark } from "@/components/brand-mark";
import { getDiscordInviteUrl } from "@/lib/config/site";

const serverName = process.env.RP_SERVER_NAME || "Los Santos Roleplay";
const serverRegion = process.env.RP_SERVER_REGION || "San Andreas";
const serverStatus = process.env.RP_SERVER_STATUS || "Status not configured";

export default function Home() {
  const inviteUrl = getDiscordInviteUrl();

  return (
    <main className="home-shell">
      <header className="site-header">
        <Link aria-label="LU SHEN GANG home" className="brand-lockup" href="/">
          <BrandMark />
          <span>
            <strong>LU SHEN</strong>
            <small>LOS SANTOS · EST. 2024</small>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="public-nav">
          <a className="nav-current" href="#home">
            Home
          </a>
          <a href="#about">The crew</a>
          <a href="#server">RP server</a>
        </nav>
        <div className="header-actions">
          <Link className="text-link" href="/login">
            Member login <ArrowUpRight aria-hidden="true" size={15} />
          </Link>
          {inviteUrl ? (
            <a className="button button-outline button-small" href={inviteUrl} rel="noreferrer" target="_blank">
              <DiscordMark />
              Join Discord
            </a>
          ) : (
            <span className="button button-outline button-small button-muted" title="Set DISCORD_INVITE_URL to enable this link">
              <DiscordMark />
              Invite not set
            </span>
          )}
        </div>
      </header>

      <section aria-labelledby="hero-title" className="hero" id="home">
        <div className="hero-shade" />
        <div className="hero-grid" />
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> LOS SANTOS · SAN ANDREAS</p>
          <h1 id="hero-title">
            LU SHEN
            <span>GANG</span>
          </h1>
          <p className="hero-lede">
            A close-knit crew. A city full of stories.
            <br />
            Make your name on the streets of Los Santos.
          </p>
          <div className="hero-actions">
            {inviteUrl ? (
              <a className="button button-red" href={inviteUrl} rel="noreferrer" target="_blank">
                <DiscordMark />
                Join our Discord
                <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            ) : (
              <span className="button button-red button-muted" title="Set DISCORD_INVITE_URL to enable this link">
                <DiscordMark />
                Discord invite not configured
              </span>
            )}
            <Link className="button button-quiet" href="/login">
              <Shield aria-hidden="true" size={16} />
              Gang member login
            </Link>
          </div>
          <div className="hero-proof">
            <span className="proof-dot" />
            <span>YOUR NEXT CHAPTER STARTS HERE</span>
            <span className="proof-divider" />
            <span>ROLEPLAY · COMMUNITY · RESPECT</span>
          </div>
        </div>

        <div className="hero-coordinate">
          <span>VINEWOOD HILLS</span>
          <span>34°08&apos; N&nbsp; 118°19&apos; W</span>
        </div>
        <a className="scroll-cue" href="#about">
          <ArrowDown aria-hidden="true" size={15} />
          <span>SCROLL TO EXPLORE</span>
        </a>
        <div className="hero-index"><span>01</span> / 03</div>
      </section>

      <section aria-label="Community highlights" className="signal-strip">
        <div><Radio aria-hidden="true" size={16} /><span>THE STREETS ARE CALLING</span></div>
        <span className="signal-separator">✳</span>
        <div><UsersRound aria-hidden="true" size={16} /><span>BUILT ON LOYALTY</span></div>
        <span className="signal-separator">✳</span>
        <div><Clock3 aria-hidden="true" size={16} /><span>YOUR STORY. YOUR PACE.</span></div>
      </section>

      <section aria-labelledby="about-title" className="about-section section-wrap" id="about">
        <div className="about-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> MORE THAN A CREW</p>
          <h2 id="about-title">A name earned.<br /><span>A family chosen.</span></h2>
        </div>
        <div className="about-detail">
          <p>
            Lu Shen Gang is a community of roleplayers who bring Los Santos to
            life together. We value thoughtful stories, dependable teammates,
            and making every scene count.
          </p>
          <a className="inline-link" href={inviteUrl ?? "/login"} rel={inviteUrl ? "noreferrer" : undefined} target={inviteUrl ? "_blank" : undefined}>
            Find your people <ChevronRight aria-hidden="true" size={16} />
          </a>
        </div>
        <div className="about-stamp" aria-hidden="true">
          <BrandMark large />
          <span>LU SHEN<br />LOS SANTOS</span>
        </div>
      </section>

      <section aria-labelledby="server-title" className="server-section" id="server">
        <div className="section-wrap server-wrap">
          <div className="server-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" /> OUR CURRENT WORLD</p>
              <h2 id="server-title">THE RP SERVER</h2>
            </div>
            <span className="placeholder-label"><span /> PLACEHOLDER DATA</span>
          </div>
          <div className="server-card">
            <div className="server-emblem"><MapPin aria-hidden="true" size={22} /></div>
            <div className="server-identity">
              <span className="server-kicker">CURRENT HOME</span>
              <h3>{serverName}</h3>
              <span className="server-location">{serverRegion} <span>·</span> FiveM roleplay</span>
            </div>
            <div className="server-status">
              <span className="status-indicator" />
              <div><small>SERVER STATUS</small><strong>{serverStatus}</strong></div>
            </div>
            <span className="server-separator" />
            <span className="server-unconfigured">Connect details will appear here<br />when the server is configured.</span>
            {inviteUrl ? (
              <a className="server-join" href={inviteUrl} rel="noreferrer" target="_blank" aria-label="Ask about joining the server on Discord">
                <ArrowUpRight aria-hidden="true" size={19} />
              </a>
            ) : (
              <span className="server-join server-join-disabled" aria-hidden="true"><ArrowUpRight size={19} /></span>
            )}
          </div>
        </div>
      </section>

      <section aria-label="Recruitment" className="recruit-section">
        <div className="recruit-inner">
          <div className="recruit-mark"><Shield aria-hidden="true" size={19} /></div>
          <div className="recruit-copy">
            <span className="eyebrow">YOUR PLACE IN THE CITY</span>
            <h2>Ready to write your story?</h2>
            <p>Recruitment details are being prepared. Join our Discord to meet the crew and hear when applications open.</p>
          </div>
          <span className="recruit-status"><span /> STATUS UNCONFIGURED</span>
          {inviteUrl ? (
            <a className="button button-red" href={inviteUrl} rel="noreferrer" target="_blank">
              Join the conversation <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          ) : (
            <Link className="button button-red" href="/login">Member login <ArrowUpRight aria-hidden="true" size={16} /></Link>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <Link aria-label="LU SHEN GANG home" className="brand-lockup footer-brand" href="/">
          <BrandMark />
          <span><strong>LU SHEN</strong><small>LOS SANTOS · EST. 2024</small></span>
        </Link>
        <p>Independent FiveM roleplay community. Not affiliated with Rockstar Games.</p>
        <div className="footer-links">
          <Link href="/login">Member portal <ChevronRight aria-hidden="true" size={13} /></Link>
          {inviteUrl && <a href={inviteUrl} rel="noreferrer" target="_blank">Discord <ArrowUpRight aria-hidden="true" size={13} /></a>}
        </div>
        <span className="copyright">© LU SHEN GANG</span>
      </footer>
    </main>
  );
}
