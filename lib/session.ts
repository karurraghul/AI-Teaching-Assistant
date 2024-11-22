// lib/session.ts
import type { ApiKeys, SecureSessionKeys } from '@/types/api';

export const SessionStorage = {
  API_KEYS: 'temp_api_keys',
} as const;

export const setSecureApiKeys = (keys: ApiKeys): void => {
  if (typeof window === 'undefined') return;
  
  const secureKeys: SecureSessionKeys = {
    deepgramKey: keys.deepgramKey,
    groqKey: keys.groqKey,
    timestamp: Date.now(),
  };
  
  // Basic encryption before storing
  const encodedKeys = btoa(JSON.stringify(secureKeys));
  
  // Store in session storage
  sessionStorage.setItem(SessionStorage.API_KEYS, encodedKeys);
  
  // Set secure cookies for middleware
  document.cookie = `x-deepgram-key=${keys.deepgramKey}; path=/; secure; samesite=strict`;
  document.cookie = `x-groq-key=${keys.groqKey}; path=/; secure; samesite=strict`;
};

export const getSecureApiKeys = (): ApiKeys | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const encodedKeys = sessionStorage.getItem(SessionStorage.API_KEYS);
    if (!encodedKeys) return null;
    
    const decodedKeys = JSON.parse(atob(encodedKeys)) as SecureSessionKeys;
    
    if (!decodedKeys.deepgramKey || !decodedKeys.groqKey) {
      return null;
    }
    
    return {
      deepgramKey: decodedKeys.deepgramKey,
      groqKey: decodedKeys.groqKey,
    };
  } catch {
    clearSecureApiKeys();
    return null;
  }
};

export const clearSecureApiKeys = (): void => {
    if (typeof window === 'undefined') return;
  
    // Clear session storage
    sessionStorage.removeItem('temp_api_keys');
  
    // List of cookies to clear
    const cookiesToClear = [
      'DEEPGRAM_API_KEY',
      'GROQ_API_KEY',
      'x-deepgram-key',
      'x-groq-key',
      'ajs_anonymous_id'
    ];
  
    // Clear cookies with correct syntax
    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict`;
      // Fallback without secure attributes for development
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    });
  };

export const verifyApiKeys = async (keys: ApiKeys): Promise<boolean> => {
  try {
    const response = await fetch('/api/verify-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(keys),
    });

    if (!response.ok) {
      throw new Error('Failed to verify API keys');
    }

    const data = await response.json();
    return data.success;
  } catch {
    return false;
  }
};