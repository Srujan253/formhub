import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isVerified: false,
      role: 'staff',
      pendingVerification: false,
      login: (userData, token) => set({
        user: userData,
        token,
        isVerified: userData.isVerified || false,
        role: userData.role || 'staff',
        pendingVerification: userData.isVerified === false
      }),
      logout: () => set({
        user: null,
        token: null,
        isVerified: false,
        role: 'staff',
        pendingVerification: false
      }),
      updateVerificationStatus: (status) => set(state => ({
        isVerified: status,
        pendingVerification: !status,
        user: state.user ? { ...state.user, isVerified: status } : null
      }))
    }),
    {
      name: 'pulse-auth-store',
    }
  )
);