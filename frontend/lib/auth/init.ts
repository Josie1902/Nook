import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool} from "pg"
import { sendEmail } from "./email";

// Refer to documentation
// 1. Main: https://better-auth.com/docs/installation#create-database-tables
// 2. Set postgres database conncection: https://better-auth.com/docs/adapters/postgresql
// 3. Google Social Provider: https://better-auth.com/docs/authentication/google

export const auth = betterAuth({
    baseUrl: process.env.BETTER_AUTH_URL,

    database: new Pool({
       database: process.env.POSTGRES_DB,
       port: Number(process.env.POSTGRES_DB),
       host: process.env.POSTGRES_HOST,
       user: process.env.POSTGRES_USER,
       password: process.env.POSTGRES_PASSWORD,
    }),

    emailAndPassword: { 
        enabled: true, 
        sendResetPassword: async ({user, url, token}, request) => {
          void sendEmail({
            to: user.email,
            subject: "Reset your password",
            text: `Click the link to reset your password: ${url}`,
          });
        },
        revokeSessionsOnPasswordReset: true,
    }, 

     emailVerification: {
        sendVerificationEmail: async ( { user, url, token }, request) => {
          void sendEmail({
            to: user.email,
            subject: "Verify your email address",
            text: `Click the link to verify your email: ${url}`,
          });
        },
      },

    socialProviders: { 
        google: { 
            prompt: "select_account", 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    }, 

    plugins: [nextCookies()]
})