import { LoginForm } from '@/components/auth/login-form';
import { YuccaLogo } from '@/components/icons/yucca-logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-8 left-8">
        <YuccaLogo className="h-10 w-auto text-primary" />
      </div>
      <LoginForm />
    </div>
  );
}
