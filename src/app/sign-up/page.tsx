import { Suspense } from 'react';
import SignUpForm from './sign-up-form';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
