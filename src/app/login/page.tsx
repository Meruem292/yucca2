import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="Yucca plants in a desert landscape background"
        layout="fill"
        objectFit="cover"
        className="-z-10" // Send to back
        data-ai-hint="yucca desert"
        priority // Prioritize loading of the background image
      />
      {/* Optional: Add an overlay for better text readability if needed */}
      {/* <div className="absolute inset-0 bg-black/30 -z-0"></div> */}
      <LoginForm />
    </div>
  );
}
