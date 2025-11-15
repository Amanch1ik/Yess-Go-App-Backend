/**
 * Утилиты для оптимизации запросов и избежания дублирования
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Дедупликация запросов - предотвращает одновременные запросы с одинаковым queryKey
 */
export const dedupeQueries = (queryClient: QueryClient) => {
  // React Query автоматически дедуплицирует запросы с одинаковым queryKey
  // Эта функция может быть использована для дополнительной логики
  return queryClient;
};

/**
 * Предзагрузка данных для улучшения UX
 */
export const prefetchData = async (
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  queryFn: () => Promise<any>
) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

/**
 * Оптимизированная инвалидация - инвалидирует только связанные запросы
 */
export const invalidateRelatedQueries = (
  queryClient: QueryClient,
  baseKey: readonly unknown[]
) => {
  // Инвалидируем все запросы, начинающиеся с baseKey
  queryClient.invalidateQueries({ 
    queryKey: baseKey,
    exact: false, // Инвалидируем все подзапросы
  });
};

/**
 * Очистка неиспользуемых кэшей
 */
export const clearUnusedCache = (queryClient: QueryClient) => {
  // React Query автоматически очищает неиспользуемые кэши через gcTime
  // Эта функция может быть использована для принудительной очистки
  queryClient.removeQueries({
    predicate: (query) => {
      // Удаляем запросы, которые не использовались более 30 минут
      const lastUsed = query.state.dataUpdatedAt;
      const now = Date.now();
      return lastUsed && (now - lastUsed) > 30 * 60 * 1000;
    },
  });
};

