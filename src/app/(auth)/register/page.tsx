import { AuthForm } from '@/components/auth/auth-form';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthForm mode="register" />
    </div>
  );
} 