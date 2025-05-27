import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  if (pathname === '/') {
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
  matcher: ['/', '/dashboard', '/chatbots/:path*'],
};
