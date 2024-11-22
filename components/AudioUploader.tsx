// components/AudioUploader.tsx
import AudioUploaderClient from "./AudioUploaderClient";
import type { AudioUploaderProps } from '@/types/quiz';

export default function AudioUploader({ onSuccess }: AudioUploaderProps) {
  return <AudioUploaderClient onSuccess={onSuccess} />;
}