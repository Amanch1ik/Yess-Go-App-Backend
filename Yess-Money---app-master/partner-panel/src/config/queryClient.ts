import { QueryClient } from '@tanstack/react-query';

/**
 * Оптимизированная конфигурация QueryClient для partner-panel
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
  // Профиль
  partnerProfile: ['partner', 'profile'] as const,
  
  // Локации
  locations: ['partner', 'locations'] as const,
  location: (id: number) => ['partner', 'locations', id] as const,
  
  // Акции
  promotions: ['partner', 'promotions'] as const,
  promotion: (id: number) => ['partner', 'promotions', id] as const,
  
  // Транзакции
  transactions: ['partner', 'transactions'] as const,
  transaction: (id: number) => ['partner', 'transactions', id] as const,
  
  // Сотрудники
  employees: ['partner', 'employees'] as const,
  employee: (id: number) => ['partner', 'employees', id] as const,
  
  // Дашборд
  dashboard: ['partner', 'dashboard'] as const,
  dashboardStats: ['partner', 'dashboard', 'stats'] as const,
  
  // Интеграции
  integrations: ['partner', 'integrations'] as const,
  
  // Биллинг
  billing: ['partner', 'billing'] as const,
  billingHistory: ['partner', 'billing', 'history'] as const,
} as const;

