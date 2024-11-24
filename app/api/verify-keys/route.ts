// app/api/verify-keys/route.ts
import { NextResponse } from 'next/server';
import type { ErrorResponse, ApiKeyVerificationResponse } from '@/types/api';

const FASTAPI_BASE_URL = 'https://ai-teaching-assistant-ir98.onrender.com';

export async function POST(request: Request) {
  try {
    const { deepgramKey, groqKey } = await request.json();
    
    console.log('Attempting to verify keys at:', `${FASTAPI_BASE_URL}/api/verify-keys`);

    if (!deepgramKey || !groqKey) {
      return NextResponse.json({ 
        success: false,
        detail: 'API keys are required',
        status: 400
      } as ErrorResponse, { status: 400 });
    }

    try {
      const verifyResponse = await fetch(`${FASTAPI_BASE_URL}/api/verify-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          deepgramKey,
          groqKey
        }),
        cache: 'no-store'
      });

      let responseData;
      const responseText = await verifyResponse.text();
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response from server');
      }

      console.log('Verification response:', responseData);

      if (!verifyResponse.ok) {
        return NextResponse.json({ 
          success: false,
          detail: responseData.detail || 'Invalid API keys',
          status: verifyResponse.status
        } as ErrorResponse, { status: verifyResponse.status });
      }

      // Create the response first
      const response = NextResponse.json({ 
        success: true
      } satisfies ApiKeyVerificationResponse);

      // Set cookies with options
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 7200 // 2 hours
      };

      // Set cookies after successful verification
      response.cookies.set('DEEPGRAM_API_KEY', deepgramKey, cookieOptions);
      response.cookies.set('GROQ_API_KEY', groqKey, cookieOptions);

      return response;

    } catch (error) {
      console.error('Verification error:', error);
      return NextResponse.json({ 
        success: false,
        detail: error instanceof Error ? error.message : 'Failed to verify API keys',
        status: 500
      } as ErrorResponse, { status: 500 });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json({ 
      success: false,
      detail: 'Invalid request format',
      status: 400
    } as ErrorResponse, { status: 400 });
  }
}