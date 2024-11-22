// app/api/quiz/route.ts

import { NextRequest, NextResponse } from 'next/server';
import type { ErrorResponse } from '@/types/api';

const FASTAPI_BASE_URL = 'http://localhost:8000/api';

export async function POST(request: NextRequest) {
  try {
    const groqKey = request.cookies.get('GROQ_API_KEY')?.value;

    if (!groqKey) {
      return NextResponse.json({
        detail: 'API key not found in session',
        status: 401
      } as ErrorResponse, { status: 401 });
    }

    const body = await request.json();
    const { text, question_count } = body;

    if (!text) {
      return NextResponse.json({
        detail: 'No text provided for quiz generation',
        status: 400
      } as ErrorResponse, { status: 400 });
    }

    // Make request to FastAPI backend
    const backendResponse = await fetch(`${FASTAPI_BASE_URL}/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'groq-api-key': groqKey
      },
      body: JSON.stringify({
        text,
        question_count: question_count || 5
      })
    });

    // Get response data
    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('Backend error:', responseData);
      return NextResponse.json(responseData, { status: backendResponse.status });
    }

    return NextResponse.json({
      success: true,
      quiz: responseData
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    
    return NextResponse.json({
      detail: error instanceof Error ? error.message : 'Failed to generate quiz',
      status: 500
    } as ErrorResponse, { status: 500 });
  }
}