'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { LogOut, LayoutDashboard, MessageSquare, Image } from 'lucide-react';
import Link from 'next/link';

import Header from '@/components/header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearToken = useAuthStore((state) => state.clearToken);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <nav className="flex w-64 flex-col gap-4 border-r border-neutral-800 bg-neutral-950 p-6">
        <h1 className="text-2xl font-bold">AI Companion</h1>
        <ul className="flex flex-col gap-2">
          <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />}>
            Dashboard
          </NavItem>
          <NavItem href="/chat" icon={<MessageSquare size={20} />}>
            New Chat
          </NavItem>
          <NavItem href="/image" icon={<Image size={20} />}>
            Image Gen
          </NavItem>
        </ul>
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md p-2 text-red-400 hover:bg-neutral-800"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-neutral-900 p-8">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2 rounded-md p-2 text-neutral-300 hover:bg-neutral-800"
      >
        {icon}
        <span>{children}</span>
      </Link>
    </li>
  );
}