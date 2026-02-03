import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Create response and add ngrok-skip-browser-warning header
  const response = NextResponse.next();
  response.headers.set('ngrok-skip-browser-warning', 'any-value');
  response.headers.set('User-Agent', 'Custom-Client/1.0');
  
  return response;
}

export const config = {
  matcher: '/:path*',
};
