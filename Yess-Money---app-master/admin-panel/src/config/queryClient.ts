import { QueryClient } from '@tanstack/react-query';

/**
 * Оптимизированная конфигурация QueryClient для admin-panel
 * 
 * Оптимизации:
 * - Увеличенное время кэширования для снижения количества запросов
 * - Настроена дедупликация запросов
 * - Оптимизированы настройки refetch
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Время, в течение которого данные считаются свежими (5 минут)
      staleTime: 5 * 60 * 1000, // 5 минут
      
      // Время хранения неактивных данных в кэше (10 минут)
      gcTime: 10 * 60 * 1000, // 10 минут (ранее cacheTime)
      
      // Не обновлять при фокусе окна (экономия трафика)
      refetchOnWindowFocus: false,
      
      // Не обновлять при переподключении (данные уже в кэше)
      refetchOnReconnect: false,
      
      // Обновлять при монтировании только если данные устарели
      refetchOnMount: true,
      
      // Количество повторных попыток при ошибке
      retry: 1,
      
      // Задержка между повторными попытками
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Структурированная обработка ошибок
      throwOnError: false,
    },
    mutations: {
      // Количество повторных попыток для мутаций
      retry: 1,
      
      // Задержка между повторными попытками
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

/**
 * Централизованные query keys для избежания дублирования
 * Все query keys должны использовать эти константы
 */
export const queryKeys = {
  // Админ профиль
  adminProfile: ['admin', 'profile'] as const,
  adminMe: ['admin', 'me'] as const,
  
  // Пользователи
  users: ['admin', 'users'] as const,
  user: (id: number) => ['admin', 'users', id] as const,
  usersStats: ['admin', 'users', 'stats'] as const,
  
  // Партнеры
  partners: ['admin', 'partners'] as const,
  partner: (id: number) => ['admin', 'partners', id] as const,
  
  // Транзакции
  transactions: ['admin', 'transactions'] as const,
  transaction: (id: number) => ['admin', 'transactions', id] as const,
  
  // Акции
  promotions: ['admin', 'promotions'] as const,
  promotion: (id: number) => ['admin', 'promotions', id] as const,
  
  // Сторисы
  stories: ['admin', 'stories'] as const,
  story: (id: number) => ['admin', 'stories', id] as const,
  
  // Рефералы
  referrals: ['admin', 'referrals'] as const,
  referralsStats: ['admin', 'referrals', 'stats'] as const,
  
  // Уведомления
  notifications: ['admin', 'notifications'] as const,
  notification: (id: number) => ['admin', 'notifications', id] as const,
  
  // Дашборд
  dashboard: ['admin', 'dashboard'] as const,
  dashboardStats: ['admin', 'dashboard', 'stats'] as const,
  
  // Аудит
  audit: ['admin', 'audit'] as const,
  auditLog: (id: number) => ['admin', 'audit', id] as const,
  
  // Настройки
  settings: ['admin', 'settings'] as const,
} as const;

