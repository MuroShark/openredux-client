import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  gamePath: string | null;
  setGamePath: (path: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      gamePath: null,
      setGamePath: (path) => set({ gamePath: path }),
    }),
    {
      name: 'app-settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);