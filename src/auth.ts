import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

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
      return typeof user.id === "string" && user.id.length > 0;
    },
    async session({ session, token }) {
      if (session.user && typeof token.sub === "string") {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
