import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

export async function proxy(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  if (pathname === '/') {
    if (process.env.NEXT_PUBLIC_APP_MODE === 'self-hosted') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (session?.user?.id) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard', '/agents/:path*'],
};
