import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';

export const useConfigStore = create(
  persist(
    (set) => ({
      language: 'jp',
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      }
    }),
    {
      name: 'pulse-config-store',
    }
  )
);