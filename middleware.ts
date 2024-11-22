// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip API routes and public files
  if (request.nextUrl.pathname.startsWith('/api') || 
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get('session_id')?.value;
  
  if (!sessionId) {
    return NextResponse.next();
  }

  // Get API keys from headers if they exist
  const deepgramKey = request.cookies.get('x-deepgram-key')?.value;
  const groqKey = request.cookies.get('x-groq-key')?.value;

  if (deepgramKey && groqKey) {
    // Add environment variables to the request
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-env-deepgram_api_key', deepgramKey);
    requestHeaders.set('x-env-groq_api_key', groqKey);

    // Add security headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};