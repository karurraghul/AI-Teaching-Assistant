'use client';

import { Suspense } from 'react';
import LandingPage from '@/components/LandingPage';
import Home from '@/components/Home';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  const showApp = searchParams.get('app');

  return showApp ? <Home /> : <LandingPage />;
}