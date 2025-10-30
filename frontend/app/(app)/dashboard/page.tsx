'use client';
import { useAuthStore } from '@/lib/store/auth';
import apiFetch from '@/lib/api';
import { useEffect, useState } from 'react';

type User = {
  email: string;
  username: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await apiFetch('/api/users/me');
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      {user ? (
        <p>
          Welcome back,{' '}
          <strong className="font-medium text-blue-300">
            {user.username || user.email}
          </strong>
          !
        </p>
      ) : (
        <p>Loading user data...</p>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold">My Chat History</h2>
        {/* TODO: Загрузить и отобразить список чатов [ChatSession] */}
        <p className="mt-4 text-neutral-400">Chat history will appear here.</p>
      </div>

       <div className="mt-8">
        <h2 className="text-2xl font-semibold">My Characters</h2>
        {/* TODO: Загрузить и отобразить список персонажей */}
        <p className="mt-4 text-neutral-400">Characters you created will appear here.</p>
      </div>
    </div>
  );
}