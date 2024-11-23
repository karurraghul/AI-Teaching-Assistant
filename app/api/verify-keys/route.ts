// app/api/verify-keys/route.ts
import { NextResponse } from 'next/server';
import type { ErrorResponse, ApiKeyVerificationResponse } from '@/types/api';

const FASTAPI_BASE_URL = 'https://ai-teaching-assistant-ir98.onrender.com/api';

export async function POST(request: Request) {
  try {
    const { deepgramKey, groqKey } = await request.json();
    
    if (!deepgramKey || !groqKey) {
      return NextResponse.json({ 
        detail: 'Missing API keys',
        status: 400
      } as ErrorResponse, { status: 400 });
    }

    try {
      const verifyResponse = await fetch(`${FASTAPI_BASE_URL}/verify-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Deepgram-Key': deepgramKey,
          'X-Groq-Key': groqKey,
        }
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        return NextResponse.json({ 
          detail: errorData.detail || 'Invalid API keys',
          status: verifyResponse.status
        } as ErrorResponse, { status: verifyResponse.status });
      }

      const response = NextResponse.json({ 
        success: true 
      } satisfies ApiKeyVerificationResponse);

      response.cookies.set('DEEPGRAM_API_KEY', deepgramKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      response.cookies.set('GROQ_API_KEY', groqKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      return response;

    } catch (error) {
      return NextResponse.json({ 
        detail: 'Failed to verify API keys with backend service',
        status: 500
      } as ErrorResponse, { status: 500 });
    }
    
  } catch (error) {
    return NextResponse.json({ 
      detail: 'Failed to process API key verification',
      status: 500
    } as ErrorResponse, { status: 500 });
  }
}