import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run middleware on all routes EXCEPT static files, images, and public assets
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|images|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};