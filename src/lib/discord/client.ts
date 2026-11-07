export interface DiscordGuildMember {
  roles: string[];
}

export class DiscordApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfterSeconds?: number,
    readonly source: "http" | "network" = "http",
  ) {
    super(message);
    this.name = "DiscordApiError";
  }
}

function getDiscordConfig() {
  const { DISCORD_BOT_TOKEN, DISCORD_GUILD_ID } = process.env;
  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
    throw new Error("Discord guild verification is not configured. Set DISCORD_BOT_TOKEN and DISCORD_GUILD_ID.");
  }
  return { token: DISCORD_BOT_TOKEN, guildId: DISCORD_GUILD_ID };
}

export async function getDiscordGuildMember(userId: string): Promise<DiscordGuildMember | null> {
  const { token, guildId } = getDiscordConfig();
  let response: Response;
  try {
    response = await fetch(
      `https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(userId)}`,
      {
        headers: { Authorization: `Bot ${token}`, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      },
    );
  } catch (error) {
    console.error("Discord guild membership request failed.", error);
    throw new DiscordApiError(
      "The site could not connect to Discord to verify guild membership.",
      503,
      undefined,
      "network",
    );
  }

  if (response.status === 404) return null;
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("retry-after"));
    throw new DiscordApiError(
      `Discord rate limit reached${Number.isFinite(retryAfter) && retryAfter > 0 ? `; retry after ${retryAfter} seconds` : ""}.`,
      response.status,
      Number.isFinite(retryAfter) ? retryAfter : undefined,
    );
  }
  if (!response.ok) {
    throw new DiscordApiError(
      `Discord guild membership could not be verified (HTTP ${response.status}). Check the bot token, guild ID, and bot permissions.`,
      response.status,
    );
  }

  const member: unknown = await response.json();
  if (
    typeof member !== "object" ||
    member === null ||
    !("roles" in member) ||
    !Array.isArray(member.roles) ||
    !member.roles.every((role): role is string => typeof role === "string")
  ) {
    throw new DiscordApiError("Discord returned an unexpected guild membership response.", response.status);
  }
  return { roles: member.roles };
}

export async function isDiscordGuildMember(userId: string): Promise<boolean> {
  return (await getDiscordGuildMember(userId)) !== null;
}
