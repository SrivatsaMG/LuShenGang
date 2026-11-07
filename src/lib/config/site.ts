export function getDiscordInviteUrl(): string | null {
  const value = process.env.DISCORD_INVITE_URL?.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    const allowedHosts = new Set(["discord.gg", "discord.com", "www.discord.com"]);
    return url.protocol === "https:" && allowedHosts.has(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}
