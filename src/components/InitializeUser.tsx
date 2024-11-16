'use client'

import { useInitializeUser } from '@/stores/useUserStore'

export default function UserInitializer() {
  useInitializeUser();
  return null;
}