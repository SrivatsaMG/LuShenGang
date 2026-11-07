import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { DiscordApiError, isDiscordGuildMember } from "@/lib/discord/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "identify" } },
    }),
  ],
  secret: process.env.AUTH_SECRET ?? process.env.SESSION_SECRET,
  trustHost:
    process.env.NODE_ENV !== "production" ||
    process.env.AUTH_TRUST_HOST === "true" ||
    process.env.VERCEL === "1",
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.id) return false;
      try {
        return await isDiscordGuildMember(user.id);
      } catch (error) {
        if (!(error instanceof DiscordApiError)) throw error;
        console.error("Discord guild membership could not be checked during sign-in.", {
          status: error.status,
          message: error.message,
          retryAfterSeconds: error.retryAfterSeconds,
        });
        if (error.status === 429) return "/login?error=discord_rate_limited";
        if (error.status === 401) return "/login?error=discord_bot_unauthorized";
        if (error.status === 403) return "/login?error=discord_bot_forbidden";
        return "/login?error=discord_verification_failed";
      }
    },
    async session({ session, token }) {
      if (session.user && typeof token.sub === "string") {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
