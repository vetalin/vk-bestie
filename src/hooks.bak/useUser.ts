import { useEffect } from 'react';
import { getUserInfo } from '../api/bridge';
import { useAppStore } from '../store/app';
import type { VKUser } from '../types';

export function useUser(): VKUser | null {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    if (!user) {
      getUserInfo().then(setUser);
    }
  }, [user, setUser]);

  return user;
}
