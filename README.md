# LU SHEN GANG — Phase 1

A Next.js App Router community portal with a public homepage, Discord OAuth login, server-verified guild/role authorization, and a protected management overview. The dashboard displays placeholders only; it does not invent live member, activity, or server statistics.

## Requirements

- Node.js 20.9 or newer
- A Discord application and bot added to the LU SHEN GANG server

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the Discord application, bot, guild, role, session, and Supabase values described below.
3. Use a random session secret of at least 32 characters. For example, generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
4. Start the app:

   ```bash
   npm install
   npm run dev
   ```

5. Open `http://localhost:3000`.

The public homepage works without Discord credentials. Login stays disabled and explains the missing setup until all required OAuth, guild, bot, and session settings are provided.

## Discord Developer Portal

1. Create a Discord application and copy its Application ID and Client Secret into `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`.
2. Under **OAuth2 → General**, add the redirect URL `http://localhost:3000/api/auth/callback/discord`. Add the production callback URL too after choosing a deployment domain.
3. Create a bot under **Bot**, copy its token into `DISCORD_BOT_TOKEN`, and add the bot to the target guild. Keep the token server-side; never prefix it with `NEXT_PUBLIC_`.
4. Enable **Server Members Intent** in the bot's privileged gateway intents. The bot must be a member of the configured guild so the server can query guild membership and role IDs.
5. Copy the target server ID into `DISCORD_GUILD_ID` and enable Developer Mode in Discord to copy server and role IDs.
6. Fill the optional owner, leader, management, and member role IDs. Users without an owner, leader, or management role can sign in as guild members but cannot access the administrative dashboard.
7. Set `DISCORD_INVITE_URL` to an HTTPS Discord invite URL. It is intentionally not fabricated when unset.
8. Configure `NEXT_PUBLIC_APP_URL` for the deployment and set a strong, private `SESSION_SECRET` of at least 32 characters.
9. In Supabase, copy the project URL to `SUPABASE_URL` and the server-side service role/secret key to `SUPABASE_SERVICE_ROLE_KEY`. Never expose this key to the browser or commit it.
10. Run `supabase/migrations/202611070001_gallery.sql` in the Supabase SQL editor. It creates the gallery metadata table and private `gang-gallery` bucket. If `SUPABASE_STORAGE_BUCKET` is changed, update the bucket ID in the migration to match.
11. When deploying behind a trusted reverse proxy, set `AUTH_TRUST_HOST=true` only if that proxy supplies the correct host headers. Local development trusts the host automatically; Vercel is detected automatically.

Auth.js handles the OAuth state/CSRF checks and issues an encrypted, HTTP-only JWT session cookie. The callback checks guild membership using the bot token. Every protected dashboard request fetches current guild roles server-side; role IDs and bot credentials are never sent to the browser. In production, serve the app over HTTPS so the Auth.js session cookie is Secure.

### Discord login troubleshooting

- If login reports that the bot token was rejected, reset the bot token in the Discord Developer Portal, update `DISCORD_BOT_TOKEN` in the Vercel **Production** environment, and redeploy.
- If Discord refuses the membership check, confirm the bot is a member of the exact server configured by `DISCORD_GUILD_ID` and enable **Server Members Intent** under the bot's privileged gateway intents.
- If verification remains unavailable, inspect the Vercel function logs for the Discord HTTP status. Never share bot tokens or client secrets in logs or support messages.

## Member photo gallery

Any signed-in member of the configured Discord guild can submit up to five photos per hour. Uploads accept JPG, PNG, or WebP up to 8 MB and remain private in Supabase Storage until an owner, leader, or management-role user approves them. Guild members can view approved photos; pending photos are visible only to their uploader and management. The server verifies guild membership and management permissions on each API request. It returns short-lived signed image URLs rather than making the storage bucket public.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm start
```

Phase 1 includes the member photo gallery and management approval workflow. Announcements, member management, recruitment, suggestions, and live server integrations remain out of scope.
