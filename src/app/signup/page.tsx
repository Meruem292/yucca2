
import { SignupForm } from '@/components/auth/signup-form';
import Image from 'next/image';

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <Image
        src="/login-background.jpg" // Updated to local image
        alt="Abstract background with yucca plant elements"
        data-ai-hint="yucca plant desert" // Keep AI hint
        fill
        className="-z-10 object-cover"
        priority
      />
      <SignupForm />
    </div>
  );
}
