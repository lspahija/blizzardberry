import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { SupabaseAdapter } from '@auth/supabase-adapter';
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
  ],
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
  callbacks: {
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
        console.error(error);
        posthog.capture('sign_in_failed', {
          userId: user.id,
          error: error.message,
        });
        return false;
      }
    },
  },
});
