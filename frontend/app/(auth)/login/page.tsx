'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/store/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

// Схема валидации
const loginSchema = z.object({
  username: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((state) => state.setToken);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      // Используем FormData для OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', data.username);
      formData.append('password', data.password);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const { access_token } = await response.json();
      setToken(access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-center text-2xl font-bold">Login</h2>
      {error && (
        <p className="rounded bg-red-900 p-2 text-center text-red-100">
          {error}
        </p>
      )}
      <div>
        <label
          htmlFor="username"
          className="mb-2 block text-sm font-medium"
        >
          Email
        </label>
        <input
          id="username"
          {...register('username')}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-400">
            {errors.username.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-5 py-2.5 text-center font-medium text-primaryForeground hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
      <p className="text-center text-sm text-neutral-400">
        No account?{' '}
        <Link href="/register" className="font-medium text-blue-400 hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}