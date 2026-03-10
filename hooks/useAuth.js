'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAuthenticated, clearSession } from '@/lib/auth';

export default function useAuth(redirect = true) {
  const router = useRouter();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      if (redirect) router.replace('/login');
      setLoading(false);
      return;
    }
    setUser(getUser());
    setLoading(false);
  }, [router, redirect]);

  function logout() {
    clearSession();
    router.replace('/login');
  }

  return { user, loading, logout };
}