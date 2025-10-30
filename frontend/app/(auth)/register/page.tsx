'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/store/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

const registerSchema = z.object({
  email: z.string().email('Неверный email'),
  password: z.string().min(6, 'Пароль от 6 символов'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((state) => state.setToken);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Ошибка регистрации');
      }

      // Автологин после регистрации
      const loginData = new URLSearchParams();
      loginData.append('username', data.email);
      loginData.append('password', data.password);

      const loginRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: loginData.toString(),
        }
      );

      const { access_token } = await loginRes.json();
      setToken(access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-center text-2xl font-bold">Регистрация</h2>
      {error && (
        <p className="rounded bg-red-900 p-2 text-center text-red-100">{error}</p>
      )}

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          Пароль
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
          Подтвердите пароль
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-5 py-2.5 text-center font-medium text-primaryForeground hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Создание...' : 'Зарегистрироваться'}
      </button>

      <p className="text-center text-sm text-neutral-400">
        Уже есть аккаунт?{' '}
        <Link href="/login" className="font-medium text-blue-400 hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}