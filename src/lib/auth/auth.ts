import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { sendVerificationRequest } from './email';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
});
