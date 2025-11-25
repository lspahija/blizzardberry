import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import sql from '@/app/api/lib/store/db';
import { sendVerificationRequest } from './magicLinkEmailAuth';
import {
  getSubscription,
  upsertSubscription,
} from '@/app/api/lib/store/subscriptionStore';
import { addCredit } from '@/app/api/lib/store/creditStore';
import posthog from 'posthog-js';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub,
    Google,
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM,
      sendVerificationRequest,
    }),
    Credentials({
      name: 'Admin Access',
      credentials: {},
      async authorize() {
        if (process.env.NEXT_PUBLIC_APP_MODE !== 'self-hosted') {
          return null;
        }

        const email = 'admin@selfhosted.com';

        // Check if user exists
        const [existingUser] = await sql`
          SELECT * FROM next_auth.users WHERE email = ${email}
        `;

        if (existingUser) {
          return existingUser;
        }

        // Create user
        const [newUser] = await sql`
          INSERT INTO next_auth.users (email, name, "emailVerified")
          VALUES (${email}, 'Admin', now())
          RETURNING *
        `;

        // Assign admin tier
        await upsertSubscription(newUser.id, 'admin_sub', 'admin_item', 'admin', new Date('2099-12-31'));
        await addCredit(newUser.id, 1000000, `${newUser.id}_admin_init`, null);

        return newUser;
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
  session: {
    strategy:
      process.env.NEXT_PUBLIC_APP_MODE === 'self-hosted' ? 'jwt' : 'database',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (
        process.env.NEXT_PUBLIC_APP_MODE === 'self-hosted' &&
        token?.sub &&
        session.user
      ) {
        session.user.id = token.sub;
      }
      return session;
    },
    async signIn({ user }) {
      try {
        const subscription = await getSubscription(user.id);
        if (!subscription) {
          await addCredit(user.id, 100, `${user.id}_free`, null);
          await upsertSubscription(user.id, null, null, 'free', null);

          posthog.capture('new_user_created', {
            userId: user.id,
            email: user.email,
            tier: 'free',
          });
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        posthog.capture('sign_in_failed', {
          userId: user.id,
          error: error.message,
        });
        return false;
      }
    },
  },
});
