import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get auth status from cookies or headers
  const isAuthenticated = false; // Replace with actual auth check

  // Protected routes pattern
  const protectedRoutes = ['/dashboard'];
  
  // Auth routes pattern
  const authRoutes = ['/login', '/register'];
  
  // Current path
  const path = request.nextUrl.pathname;

  // If trying to access protected route while not authenticated
  if (protectedRoutes.some(route => path.startsWith(route)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access auth routes while authenticated
  if (authRoutes.some(route => path.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
};