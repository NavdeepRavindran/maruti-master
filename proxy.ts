import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-maruthi-key-must-change");

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Protect Client Portal Routes
  if (pathname.startsWith('/client-portal/')) {
    const token = request.cookies.get('client_portal_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/client-login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Ensure clients can only access their own dashboard ID
      const requestedId = pathname.split('/')[2]; 
      if (payload.clientId !== requestedId) {
        return NextResponse.redirect(new URL('/client-login', request.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/client-login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/client-portal/:path*', '/api/:path*'],
};
