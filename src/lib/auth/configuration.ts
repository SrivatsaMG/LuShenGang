const SESSION_SECRET = process.env.AUTH_SECRET ?? process.env.SESSION_SECRET;

export function getDiscordLoginSetupIssues(): string[] {
  const issues: string[] = [];
  if (!process.env.DISCORD_CLIENT_ID) issues.push("Set DISCORD_CLIENT_ID.");
  if (!process.env.DISCORD_CLIENT_SECRET) issues.push("Set DISCORD_CLIENT_SECRET.");
  if (!process.env.DISCORD_GUILD_ID) issues.push("Set DISCORD_GUILD_ID.");
  if (!process.env.DISCORD_BOT_TOKEN) issues.push("Set DISCORD_BOT_TOKEN.");
  if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
    issues.push("Set SESSION_SECRET to a random value at least 32 characters long.");
  }
  return issues;
}

export function isDiscordLoginConfigured(): boolean {
  return getDiscordLoginSetupIssues().length === 0;
}
