// app/api/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { 
  AudioProcessingResponse, 
  ErrorResponse,
  SessionResponse,
  SessionValidationResponse 
} from '@/types/api';

const BACKEND_URL = 'https://ai-teaching-assistant-ir98.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    console.log('Request Content-Type:', contentType);

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({
        detail: 'Invalid content type',
        status: 400
      } as ErrorResponse, { status: 400 });
    }

    const deepgramKey = request.cookies.get('DEEPGRAM_API_KEY')?.value;
    const groqKey = request.cookies.get('GROQ_API_KEY')?.value;

    if (!deepgramKey || !groqKey) {
      return NextResponse.json({
        detail: 'API keys not found in session',
        status: 401
      } as ErrorResponse, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio_file');

    if (!audioFile) {
      return NextResponse.json({
        detail: 'No audio file provided',
        status: 400
      } as ErrorResponse, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append('audio_file', audioFile);

    console.log('Making request to:', `${BACKEND_URL}/api/process-audio`);
    const backendResponse = await fetch(`${BACKEND_URL}/api/process-audio`, {
      method: 'POST',
      headers: {
        'X-Deepgram-Key': deepgramKey,
        'X-Groq-Key': groqKey,
      },
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.error('Audio processing failed:', errorData);
      return NextResponse.json({
        detail: errorData.detail || 'Failed to process audio file',
        status: backendResponse.status
      } as ErrorResponse, { status: backendResponse.status });
    }

    const audioData = await backendResponse.json();
    console.log('Audio processing successful:', audioData);

    if (!audioData.transcript) {
      console.error('Invalid response data:', audioData);
      return NextResponse.json({
        detail: 'No transcript was generated from the audio',
        status: 500
      } as ErrorResponse, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transcript: audioData.transcript,
      notes_file: audioData.notes_file || null,
      message: 'Audio processed successfully',
      quiz: { questions: [] }
    } satisfies AudioProcessingResponse);

  } catch (error) {
    console.error('Error in session/route:', error);
    return NextResponse.json({
      detail: error instanceof Error ? error.message : 'Failed to process request',
      status: 500
    } as ErrorResponse, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cleanupResponse = await fetch(`${BACKEND_URL}/api/cleanup-session`, {
      method: 'DELETE',
    });

    if (!cleanupResponse.ok) {
      console.error('Storage cleanup failed');
    }

    const cleanupData = await cleanupResponse.json();

    const response = new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: cleanupData.message || 'Session cleared successfully' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const cookiesToClear = [
      'DEEPGRAM_API_KEY',
      'GROQ_API_KEY',
      'x-deepgram-key',
      'x-groq-key',
      'ajs_anonymous_id'
    ];

    cookiesToClear.forEach(cookieName => {
      response.cookies.delete(cookieName);
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to clear session completely, but cookies were removed',
      detail: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    
    if (pathParts.includes('download') && pathParts.includes('notes')) {
      const filename = pathParts[pathParts.length - 1];
      const deepgramKey = request.cookies.get('DEEPGRAM_API_KEY')?.value;
      const groqKey = request.cookies.get('GROQ_API_KEY')?.value;

      console.log('Download request received for:', filename);

      if (!deepgramKey || !groqKey) {
        console.error('API keys missing from cookies');
        return NextResponse.json({
          detail: 'API keys not found in session',
          status: 401
        } as ErrorResponse, { status: 401 });
      }

      try {
        console.log('Making request to:', `${BACKEND_URL}/api/download/notes/${filename}`);
        const response = await fetch(
          `${BACKEND_URL}/api/download/notes/${filename}`,
          {
            headers: {
              'X-Deepgram-Key': deepgramKey,
              'X-Groq-Key': groqKey,
              'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error('FastAPI download failed:', error);
          return NextResponse.json({
            detail: error.detail || `Failed to download notes: ${response.status}`,
            status: response.status
          } as ErrorResponse, { status: response.status });
        }

        const blob = await response.blob();
        
        return new NextResponse(blob, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });

      } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({
          detail: 'Failed to download notes',
          status: 500
        } as ErrorResponse, { status: 500 });
      }
    }

    const deepgramKey = request.cookies.get('DEEPGRAM_API_KEY');
    const groqKey = request.cookies.get('GROQ_API_KEY');
    
    const isValid = !!(deepgramKey?.value && groqKey?.value);
    console.log('Session check:', { 
      isValid, 
      hasDeepgram: !!deepgramKey?.value, 
      hasGroq: !!groqKey?.value 
    });
    
    return NextResponse.json({
      isValid
    } satisfies SessionValidationResponse);
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({ 
      detail: error instanceof Error ? error.message : 'Unknown error',
      status: 500 
    } as ErrorResponse, { status: 500 });
  }
}