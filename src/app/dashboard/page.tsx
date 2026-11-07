import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Camera,
  CarFront,
  ChevronRight,
  CircleHelp,
  Clock3,
  FolderOpen,
  Gauge,
  Image as ImageIcon,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Megaphone,
  Settings,
  Shield,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { auth } from "@/auth";
import { BrandMark } from "@/components/brand-mark";
import { logout } from "@/app/dashboard/actions";
import { getAuthorizationForUser } from "@/lib/permissions/authorization";

export const metadata: Metadata = { title: "Management Dashboard" };

const comingSoonItems = [
  { label: "Announcements", icon: Megaphone },
  { label: "Members", icon: UsersRound },
  { label: "Recruitment", icon: UserRoundPlus },
  { label: "RP Server", icon: CarFront },
  { label: "Suggestions", icon: Lightbulb },
];

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "L";
}

function DiscordAvatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return <Image alt={`${name}'s Discord avatar`} className="avatar" height={36} src={image} unoptimized width={36} />;
  }
  return <span aria-label={`${name}'s Discord avatar`} className="avatar avatar-fallback">{initials(name)}</span>;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<main aria-busy="true" className="dashboard-loading">Loading secure dashboard…</main>}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fdashboard");

  const authorization = await getAuthorizationForUser(session.user.id);
  if (!authorization.permissions.includes("dashboard:read")) {
    redirect("/unauthorized");
  }

  const displayName = session.user.name || "Gang member";
  const avatar = session.user.image ?? null;
  const serverName = process.env.RP_SERVER_NAME || "RP server not configured";
  const now = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date());

  return (
    <main className="dashboard-shell">
      <aside aria-label="Dashboard sidebar" className="dashboard-sidebar">
        <Link aria-label="LU SHEN GANG home" className="brand-lockup dashboard-brand" href="/">
          <BrandMark />
          <span><strong>LU SHEN</strong><small>MANAGEMENT PORTAL</small></span>
        </Link>
        <p className="sidebar-caption">OVERVIEW</p>
        <nav aria-label="Dashboard navigation" className="sidebar-nav">
          <Link aria-current="page" className="sidebar-link sidebar-link-active" href="/dashboard">
            <LayoutDashboard aria-hidden="true" size={15} /> Dashboard
          </Link>
        </nav>
        <p className="sidebar-caption">COMMUNITY</p>
        <nav aria-label="Coming soon navigation" className="sidebar-nav">
          {comingSoonItems.map(({ label, icon: Icon }) => (
            <span aria-disabled="true" className="sidebar-link sidebar-disabled" key={label}>
              <Icon aria-hidden="true" size={15} /> {label}<small className="coming-soon">SOON</small>
            </span>
          ))}
          <Link className="sidebar-link" href="/gallery">
            <ImageIcon aria-hidden="true" size={15} /> Gallery
          </Link>
        </nav>
        <p className="sidebar-caption">ACCOUNT</p>
        <nav aria-label="Account navigation" className="sidebar-nav">
          <a className="sidebar-link" href="#settings" title="Settings are managed through server configuration">
            <Settings aria-hidden="true" size={15} /> Settings
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <DiscordAvatar image={avatar} name={displayName} />
            <span><strong>{displayName}</strong><small>{authorization.accessLevel} access</small></span>
          </div>
          <form action={logout}>
            <button className="logout-button" type="submit"><LogOut aria-hidden="true" size={14} /> Log out</button>
          </form>
        </div>
      </aside>

      <section aria-label="Dashboard overview" className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="dashboard-breadcrumb"><span>LU SHEN GANG</span><ChevronRight aria-hidden="true" size={13} /><strong>Dashboard</strong></div>
          <div className="topbar-right">
            <span className="secure-label"><Shield aria-hidden="true" size={13} /> Secure management</span>
            <span aria-hidden="true" className="topbar-divider" />
            <DiscordAvatar image={avatar} name={displayName} />
          </div>
        </div>

        <header className="dashboard-greeting">
          <div>
            <p className="eyebrow"><span className="eyebrow-line" /> PRIVATE COMMUNITY PORTAL</p>
            <h1>Welcome back, <span>{displayName}</span></h1>
            <p>Here&apos;s the current overview of your gang community.</p>
          </div>
          <span className="dashboard-date"><CalendarDays aria-hidden="true" size={13} /> {now}</span>
        </header>

        <section aria-label="Gang identity" className="dashboard-crew-banner">
          <div className="crew-banner-copy">
            <span>COMMUNITY PORTAL <i /> LS · 01</span>
            <h2>LU SHEN GANG</h2>
            <p>A private space for the crew behind the stories.</p>
          </div>
          <BrandMark large />
          <div className="crew-banner-access"><small>YOUR ACCESS</small><strong>{authorization.accessLevel}</strong></div>
          <div aria-hidden="true" className="crew-banner-lines" />
        </section>

        <section aria-label="Community statistics" className="dash-stat-grid">
          <StatCard icon={<UsersRound size={15} />} label="Total members" value="—" detail="Placeholder · not configured" />
          <StatCard icon={<Activity size={15} />} label="Online members" value="—" detail="Placeholder · not configured" />
          <StatCard icon={<Bell size={15} />} label="Announcements" value="—" detail="Coming soon" />
          <StatCard icon={<Camera size={15} />} label="Gallery images" value="—" detail="Photo submissions enabled" />
        </section>

        <div className="dashboard-content-grid">
          <section aria-labelledby="activity-title" className="dash-panel">
            <div className="dash-panel-header">
              <h2 id="activity-title">Recent activity</h2>
              <span className="panel-subtitle">PLACEHOLDER</span>
            </div>
            <div className="dash-panel-body">
              <div className="activity-empty">
                <span className="activity-empty-icon"><Clock3 aria-hidden="true" size={18} /></span>
                <strong>No activity to show yet</strong>
                <p>Recent community activity will appear here when activity tracking is configured.</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="server-panel-title" className="dash-panel">
            <div className="dash-panel-header">
              <h2 id="server-panel-title">Current RP server</h2>
              <span className="panel-subtitle">PLACEHOLDER</span>
            </div>
            <div className="dash-panel-body">
              <div className="server-mini">
                <span className="server-mini-icon"><CarFront aria-hidden="true" size={17} /></span>
                <span><strong>{serverName}</strong><small>Connection details not configured</small></span>
              </div>
              <div className="dashboard-placeholder">
                <strong>Server status unavailable</strong>
                <span>Live status integration is not configured.</span>
              </div>
            </div>
          </section>
        </div>

        <div className="dashboard-lower-grid">
          <section aria-label="Community gallery">
            <Link aria-labelledby="gallery-title" className="placeholder-tile" href="/gallery">
              <span className="placeholder-tile-icon"><FolderOpen aria-hidden="true" size={18} /></span>
              <div><strong id="gallery-title">Community gallery</strong><span>Members can submit photos for management review.</span></div>
            </Link>
          </section>
          <section aria-labelledby="updates-title" className="placeholder-tile">
            <span className="placeholder-tile-icon"><CircleHelp aria-hidden="true" size={18} /></span>
            <div><strong id="updates-title">Phase 1 dashboard</strong><span>Overview and server-backed access are active.</span></div>
          </section>
        </div>
        <p className="overview-note"><Gauge aria-hidden="true" size={13} /> Statistics remain unconfigured placeholders; no live member or server data is being displayed.</p>

        <section aria-label="Settings information" className="sr-only" id="settings">
          Dashboard settings are controlled by the server environment.
        </section>
      </section>
    </main>
  );
}

function StatCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <article className="dash-stat-card">
      <div className="dash-stat-head"><span>{label}</span><span className="dash-stat-icon">{icon}</span></div>
      <div className="dash-stat-value">{value}<small>placeholder</small></div>
      <div className="dash-stat-foot"><ArrowUpRight aria-hidden="true" size={11} /> {detail}</div>
    </article>
  );
}
