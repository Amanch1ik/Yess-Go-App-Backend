import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PartnerUser {
  id: string;
  email?: string;
  username?: string;
  role?: string;
  avatar_url?: string;
}

interface AuthState {
  user: PartnerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: PartnerUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

/**
 * Оптимизированный auth store с персистентностью
 * 
 * Оптимизации:
 * - Персистентность через localStorage для сохранения состояния между сессиями
 * - Автоматическая очистка при logout
 * - Оптимизированная структура для избежания лишних ре-рендеров
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user, 
        isLoading: false 
      }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => {
        // Очищаем localStorage при выходе
        localStorage.removeItem('partner_token');
        localStorage.removeItem('partner_user');
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      },
    }),
    {
      name: 'partner-auth-storage', // Уникальное имя для localStorage
      partialize: (state) => ({
        // Сохраняем только необходимые данные
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // isLoading не сохраняем - всегда начинаем с true
      }),
    }
  )
);
