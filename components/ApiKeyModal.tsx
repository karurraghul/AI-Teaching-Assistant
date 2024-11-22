// components/ApiKeyModal.tsx
'use client';

import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { setSecureApiKeys, verifyApiKeys } from '@/lib/session';
import type { ApiKeys, ApiKeyModalProps } from '@/types/api';

const ApiKeyModal = ({ onKeysSubmitted }: ApiKeyModalProps) => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    deepgramKey: '',
    groqKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!apiKeys.deepgramKey.trim() || !apiKeys.groqKey.trim()) {
      toast({
        title: "Error",
        description: "Both API keys are required",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const isValid = await verifyApiKeys(apiKeys);
      
      if (!isValid) {
        throw new Error('Invalid API keys');
      }

      setSecureApiKeys(apiKeys);
      await onKeysSubmitted();
      
    } catch (error) {
      console.error('API key verification error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify API keys",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Enter API Keys</h2>
          <p className="text-muted-foreground">
            Your keys will be securely stored for this session only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="deepgram" className="block text-sm font-medium mb-2">
              Deepgram API Key
            </label>
            <Input
              id="deepgram"
              type="password"
              placeholder="Enter your Deepgram API key"
              value={apiKeys.deepgramKey}
              onChange={(e) => setApiKeys((prev: ApiKeys) => ({ ...prev, deepgramKey: e.target.value }))}
              required
              className="w-full"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="groq" className="block text-sm font-medium mb-2">
              Groq API Key
            </label>
            <Input
              id="groq"
              type="password"
              placeholder="Enter your Groq API key"
              value={apiKeys.groqKey}
              onChange={(e) => setApiKeys((prev: ApiKeys) => ({ ...prev, groqKey: e.target.value }))}
              required
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;