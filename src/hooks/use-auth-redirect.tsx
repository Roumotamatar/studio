'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';

export function useAuthRedirect() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if we're still loading the user's auth state
    if (isUserLoading) {
      return;
    }

    const isAuthPage = pathname === '/login';

    // If the user is not authenticated and is not on the login page, redirect them.
    if (!user && !isAuthPage) {
      router.replace('/login');
    }
    // If the user is authenticated and somehow lands on the login page, redirect them away.
    else if (user && isAuthPage) {
      router.replace('/');
    }
  }, [user, isUserLoading, router, pathname]);
}
