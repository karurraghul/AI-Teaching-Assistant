// Change app/page.tsx to:
'use client';

import LandingPage from '@/components/LandingPage';
import Home from '@/components/Home';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams();
  const showApp = searchParams.get('app');

  return showApp ? <Home /> : <LandingPage />;
}