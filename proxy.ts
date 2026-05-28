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
      
      // Ensure they can only access their own dashboard ID
      const requestedId = pathname.split('/')[2]; 
      if (payload.clientId !== requestedId) {
        return NextResponse.redirect(new URL('/client-login', request.url));
      }

      return NextResponse.next();
    } catch (err) {
      // Token invalid or expired
      return NextResponse.redirect(new URL('/client-login', request.url));
    }
  }

  // 2. Protect API Routes (Simplified for Client Portal APIs)
  if (pathname.startsWith('/api/clients/') && !pathname.includes('/regenerate') && request.method === 'GET') {
    // If it's a specific client API call, we can check if they have a token or an agent session.
    // Since we don't have full agent auth setup yet in this codebase, we'll allow it if they have a valid client token
    // for that specific ID, OR if we assume agent for now.
    // For a fully production app, you would verify Supabase Auth for agents here.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/client-portal/:path*', '/api/:path*'],
};
