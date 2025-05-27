import { SignupForm } from '@/components/auth/signup-form';
import Image from 'next/image';

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="Abstract background with yucca plant elements"
        data-ai-hint="yucca plant desert"
        fill
        className="-z-10 object-cover"
        priority
      />
      <SignupForm />
    </div>
  );
}
