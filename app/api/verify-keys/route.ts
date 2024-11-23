// app/api/verify-keys/route.ts
import { NextResponse } from 'next/server';
import type { ErrorResponse, ApiKeyVerificationResponse } from '@/types/api';

const FASTAPI_BASE_URL = 'https://ai-teaching-assistant-ir98.onrender.com';

export async function POST(request: Request) {
  try {
    const { deepgramKey, groqKey } = await request.json();
    
    console.log('Attempting to verify keys');

    if (!deepgramKey || !groqKey) {
      return NextResponse.json({ 
        detail: 'API keys are required',
        status: 400
      } as ErrorResponse, { status: 400 });
    }

    try {
      const verifyResponse = await fetch(`${FASTAPI_BASE_URL}/api/verify-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Deepgram-Key': deepgramKey,
          'X-Groq-Key': groqKey,
        }
      });

      const responseData = await verifyResponse.json();
      console.log('Verification response:', responseData);

      if (!verifyResponse.ok) {
        return NextResponse.json({ 
          detail: responseData.detail || 'Invalid API keys',
          status: verifyResponse.status
        } as ErrorResponse, { status: verifyResponse.status });
      }

      // Only use the success property as per type definition
      const response = NextResponse.json({ 
        success: true
      } satisfies ApiKeyVerificationResponse);

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'lax' as const,
        path: '/'
      };

      response.cookies.set('DEEPGRAM_API_KEY', deepgramKey, cookieOptions);
      response.cookies.set('GROQ_API_KEY', groqKey, cookieOptions);

      return response;

    } catch (error) {
      console.error('Verification error:', error);
      return NextResponse.json({ 
        detail: 'Failed to verify API keys',
        status: 500
      } as ErrorResponse, { status: 500 });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json({ 
      detail: 'Invalid request format',
      status: 400
    } as ErrorResponse, { status: 400 });
  }
}