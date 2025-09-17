import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { logger } from '@/app/api/lib/logger/logger';

export async function middleware(req: NextRequest) {
  try {
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
  } catch (error) {
    // Log middleware errors
    logger.error({
      error,
      url: req.url,
      method: req.method,
      userAgent: req.headers.get('user-agent'),
      component: 'middleware',
      action: 'request_processing'
    }, `Middleware Error: ${req.method} ${req.url}`)

    // Continue with request on middleware errors
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/', '/dashboard', '/agents/:path*'],
};
