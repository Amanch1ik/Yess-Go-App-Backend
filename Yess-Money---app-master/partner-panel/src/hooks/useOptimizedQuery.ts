import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryClient';

/**
 * Хук для оптимизированных запросов с предустановленными настройками
 * 
 * Использование:
 * const { data, isLoading } = useOptimizedQuery(
 *   queryKeys.partnerProfile,
 *   () => partnerApi.getProfile(),
 *   { staleTime: 10 * 60 * 1000 } // опциональные переопределения
 * );
 */
export function useOptimizedQuery<TData = unknown, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    // Базовые оптимизации
    staleTime: 5 * 60 * 1000, // 5 минут по умолчанию
    gcTime: 10 * 60 * 1000, // 10 минут кэш
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...options, // Позволяет переопределить настройки
  });
}

