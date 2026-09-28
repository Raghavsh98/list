import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { Pool } from "pg"

/**
 * Google only, on purpose: a Google account costs a bot something, an inbox does not.
 * Reading never touches this — sign-in gates writing.
 */
const connectionString = process.env.DATABASE_URL

export const auth = betterAuth({
  database: connectionString ? new Pool({ connectionString }) : undefined,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: false },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [nextCookies()],
})

/** True when the deployment has everything Google sign-in needs. */
export const authConfigured = Boolean(
  connectionString && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
)
