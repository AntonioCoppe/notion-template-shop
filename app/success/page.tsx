import { Suspense } from 'react';
import SuccessClient from './SuccessClient';

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center p-12">Loading...</div>}>
      <SuccessClient />
    </Suspense>
  );
}
