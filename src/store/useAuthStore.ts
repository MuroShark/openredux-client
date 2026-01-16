import { create } from 'zustand';
import { User } from '../data/user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isRestoring: boolean; // Состояние восстановления сессии при запуске

  login: (provider: 'discord' | 'telegram', data?: any) => Promise<void>;
  loginWithToken: (refreshToken: string) => Promise<void>;
  updateProfile: (data: { bio: string; socialLinks: any }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>; // Метод для проверки Refresh токена при старте
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// --- Secure Storage Helper ---
// В продакшене заменить на вызовы Tauri API (tauri-plugin-store / keyring)
const SecureStorage = {
  setItem: async (key: string, value: string) => {
    // Пример для Tauri: await invoke('secure_save', { key, value });
    localStorage.setItem('secure_' + key, value); // Fallback для разработки
  },
  getItem: async (key: string): Promise<string | null> => {
    // Пример для Tauri: return await invoke('secure_read', { key });
    return localStorage.getItem('secure_' + key);
  },
  removeItem: async (key: string) => {
    localStorage.removeItem('secure_' + key);
  }
};

// Store без persist middleware, данные живут только в памяти
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isRestoring: true,

  login: async (provider, data) => {
    if (provider === 'telegram' && data) {
      try {
        const response = await fetch(`${API_URL}/api/auth/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Login failed');

        const { user, accessToken, refreshToken } = await response.json();

        // 1. Сохраняем Refresh Token в защищенное хранилище ОС
        await SecureStorage.setItem('refresh_token', refreshToken);

        // 2. Access Token и User храним только в памяти (Zustand)
        set({ user, accessToken, isAuthenticated: true });
      } catch (error) {
        console.error("Login error:", error);
      }
    }
    
    if (provider === 'discord' && data) {
      try {
        const response = await fetch(`${API_URL}/api/auth/discord`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data), // { code, redirectUri }
        });
        if (!response.ok) throw new Error('Discord login failed');
        const { user, accessToken, refreshToken } = await response.json();
        await SecureStorage.setItem('refresh_token', refreshToken);
        set({ user, accessToken, isAuthenticated: true });
      } catch (error) { console.error(error); }
    }
  },

  loginWithToken: async (refreshToken) => {
    await SecureStorage.setItem('refresh_token', refreshToken);
    await get().checkAuth();
  },

  updateProfile: async (data) => {
    const { accessToken, user } = get();
    if (!accessToken) return;

    // Для Mock-аккаунтов (Dev Mode) обновляем локально, так как токен невалиден для сервера
    if (accessToken === 'mock_token' && user) {
      set({
        user: { ...user, bio: data.bio, socialLinks: data.socialLinks }
      });
      // Эмуляция задержки сети для реалистичности
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updatedUser = await res.json();
      set({ user: updatedUser });
    } catch (e) { console.error(e); }
  },

  logout: async () => {
    await SecureStorage.removeItem('refresh_token');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isRestoring: true });
    try {
      const refreshToken = await SecureStorage.getItem('refresh_token');
      if (!refreshToken) {
        set({ isRestoring: false });
        return;
      }

      // Пытаемся обновить Access Token
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const { accessToken, refreshToken: newRefresh, user } = await response.json();
        // Ротация токена
        if (newRefresh) await SecureStorage.setItem('refresh_token', newRefresh);
        
        set({ accessToken, user, isAuthenticated: true });
      } else {
        // Если Refresh Token протух — разлогиниваем
        await SecureStorage.removeItem('refresh_token');
      }
    } catch (e) {
      console.error("Auth check failed:", e);
    } finally {
      set({ isRestoring: false });
    }
  }
}));