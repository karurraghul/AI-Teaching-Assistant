// components/BackButton.tsx
'use client';

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  onBack?: () => void;
  route?: string;
}

export const BackButton = ({ onBack, route }: BackButtonProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (onBack) {
      onBack();
    } else if (route) {
      router.push(route);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="fixed top-4 left-4 flex items-center gap-2 hover:bg-primary/10 z-50"
    >
      <ChevronLeft className="w-4 h-4" />
      Back
    </Button>
  );
};