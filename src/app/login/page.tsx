
import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <Image
        src="/login-background.png" // Updated to local image
        alt="Yucca plants in a desert landscape background"
        fill
        className="-z-10 object-cover"
        data-ai-hint="yucca plant" // Keep AI hint for future replacement if needed
        priority // Prioritize loading of the background image
      />
      {/* Optional: Add an overlay for better text readability if needed */}
      {/* <div className="absolute inset-0 bg-black/30 -z-0"></div> */}
      <LoginForm />
    </div>
  );
}
