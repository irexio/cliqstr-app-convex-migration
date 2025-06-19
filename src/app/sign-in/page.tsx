import { Suspense } from 'react';
import SignInForm from './sign-in-form';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Suspense fallback={<div>Loading form...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
