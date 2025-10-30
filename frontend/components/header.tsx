'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { isAuthenticated, clearToken } = useAuthStore();

  return (
    <header className="border-b border-neutral-800 bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          AI Companion
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/chat" className="text-foreground hover:text-primary">
            Чат
          </Link>
          <Link href="/image" className="text-foreground hover:text-primary">
            Изображения
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Профиль</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearToken();
                  window.location.href = '/';
                }}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Выйти
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Войти</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Регистрация</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}