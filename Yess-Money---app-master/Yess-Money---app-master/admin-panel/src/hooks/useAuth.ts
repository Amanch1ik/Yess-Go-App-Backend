import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, logout } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');

      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        logout();
      }
    };

    checkAuth();
  }, [setUser, logout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };
};
