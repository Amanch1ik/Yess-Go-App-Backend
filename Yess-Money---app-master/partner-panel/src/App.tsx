<<<<<<< HEAD
import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Spin, App as AntApp } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import enUS from 'antd/locale/en_US';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/MainLayout';
import { LoginPage } from './pages/LoginPage';
=======
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Spin } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import enUS from 'antd/locale/en_US';
import { Suspense } from 'react';
import { MainLayout } from './components/MainLayout';
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { LocationsPage } from './pages/LocationsPage';
import { PromotionsPage } from './pages/PromotionsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { BillingPage } from './pages/BillingPage';
<<<<<<< HEAD
import { ErrorBoundary } from './components/ErrorBoundary';
import { i18n } from './i18n';
import { queryClient } from './config/queryClient';
import { partnerTheme } from './styles/theme';
=======

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932

// Fallback компонент для Suspense
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
<<<<<<< HEAD
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #0F2A1D 0%, #375534 25%, #689071 50%, #AEC380 75%, #E3EED4 100%)',
  }}>
    <Spin size="large" />
    <div style={{ marginTop: 16, color: '#0F2A1D', fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>Загрузка...</div>
  </div>
);

// Анимация для переходов между страницами
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3
};

// Компонент для анимированных страниц
const AnimatedPage = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

function App() {
  const [language, setLanguage] = useState(i18n.getLanguage());
  const antdLocale = language === 'en' ? enUS : ruRU;

  // Слушаем изменения языка
  useEffect(() => {
    const unsubscribe = i18n.subscribe(() => {
      setLanguage(i18n.getLanguage());
    });
    return unsubscribe;
  }, []);
  
  // Глобальная обработка ошибок
  useEffect(() => {
    // Игнорируем ошибки Shadow DOM (обычно из внешних библиотек/расширений)
    const originalError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      // Игнорируем ошибки Shadow DOM
      if (message && typeof message === 'string' && message.includes('attachShadow')) {
        return true; // Предотвращаем вывод ошибки в консоль
      }
      // Игнорируем ошибки WebSocket после отключения
      if (message && typeof message === 'string' && message.includes('WebSocket connection')) {
        // Проверяем, не был ли WebSocket отключен
        const wsDisabled = localStorage.getItem('ws_disabled') === 'true';
        if (wsDisabled) {
          return true; // Предотвращаем вывод ошибки в консоль
        }
      }
      // Для остальных ошибок используем стандартную обработку
      if (originalError) {
        return originalError(message, source, lineno, colno, error);
      }
      return false;
    };

    // Обработка необработанных промисов
    const unhandledRejection = (event: PromiseRejectionEvent) => {
      // Игнорируем ошибки WebSocket
      if (event.reason && typeof event.reason === 'object' && 'message' in event.reason) {
        const message = String(event.reason.message || '');
        if (message.includes('WebSocket') || message.includes('attachShadow')) {
          event.preventDefault();
          return;
        }
      }
    };
    window.addEventListener('unhandledrejection', unhandledRejection);

    return () => {
      window.onerror = originalError;
      window.removeEventListener('unhandledrejection', unhandledRejection);
    };
  }, []);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          locale={antdLocale}
          theme={{
            token: {
              colorPrimary: partnerTheme.colors.primary,
              borderRadius: partnerTheme.borderRadius,
              fontFamily: partnerTheme.fonts.family,
              colorSuccess: partnerTheme.colors.success,
              colorError: partnerTheme.colors.error,
              colorWarning: partnerTheme.colors.warning,
              colorInfo: partnerTheme.colors.info,
            },
            components: {
              Menu: {
                itemSelectedBg: `linear-gradient(135deg, ${partnerTheme.colors.primaryDark} 0%, ${partnerTheme.colors.primary} 50%, ${partnerTheme.colors.primaryLight} 100%)`,
                itemSelectedColor: '#ffffff',
                itemHoverBg: partnerTheme.colors.primaryPale,
                itemActiveBg: `linear-gradient(135deg, ${partnerTheme.colors.primaryDark} 0%, ${partnerTheme.colors.primary} 50%, ${partnerTheme.colors.primaryLight} 100%)`,
                itemBorderRadius: 12,
              },
              Button: {
                borderRadius: 12,
                primaryShadow: `0 4px 16px rgba(104, 144, 113, 0.4)`,
                fontWeight: 600,
              },
              Card: {
                borderRadius: 16,
                boxShadow: `0 2px 16px rgba(15, 42, 29, 0.12)`,
                paddingLG: 24,
              },
              Input: {
                borderRadius: 12,
                activeBorderColor: partnerTheme.colors.primary,
                hoverBorderColor: partnerTheme.colors.primaryLight,
              },
              Table: {
                borderRadius: 12,
                headerBg: `linear-gradient(135deg, ${partnerTheme.colors.primaryPale} 0%, #ffffff 100%)`,
                headerColor: partnerTheme.colors.primaryVeryDark,
              },
            },
          }}
        >
          <AntApp>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Suspense fallback={<LoadingFallback />}>
                <AppRoutes />
              </Suspense>
            </BrowserRouter>
          </AntApp>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Компонент для роутов с анимацией
function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                      <Route path="/" element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
                      <Route path="/profile" element={<AnimatedPage><ProfilePage /></AnimatedPage>} />
                      <Route path="/locations" element={<AnimatedPage><LocationsPage /></AnimatedPage>} />
                      <Route path="/promotions" element={<AnimatedPage><PromotionsPage /></AnimatedPage>} />
                      <Route path="/transactions" element={<AnimatedPage><TransactionsPage /></AnimatedPage>} />
                      <Route path="/employees" element={<AnimatedPage><EmployeesPage /></AnimatedPage>} />
                      <Route path="/integrations" element={<AnimatedPage><IntegrationsPage /></AnimatedPage>} />
                      <Route path="/billing" element={<AnimatedPage><BillingPage /></AnimatedPage>} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </AnimatePresence>
                </Suspense>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
=======
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #F5A623 0%, #F7B731 50%, #FFC859 100%)',
  }}>
    <Spin size="large" tip="Загрузка..." />
  </div>
);

function App() {
  const language = localStorage.getItem('language') || 'ru';
  const antdLocale = language === 'en' ? enUS : ruRU;
  
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={antdLocale}
        theme={{
          token: {
            colorPrimary: '#F5A623',
            borderRadius: 12,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            colorSuccess: '#52c41a',
            colorError: '#ff4d4f',
            colorWarning: '#faad14',
            colorInfo: '#1890ff',
          },
          components: {
            Menu: {
              itemSelectedBg: 'linear-gradient(135deg, #F5A623 0%, #F7B731 100%)',
              itemSelectedColor: '#ffffff',
              itemHoverBg: '#FFF4E6',
              itemActiveBg: 'linear-gradient(135deg, #F5A623 0%, #F7B731 100%)',
              itemBorderRadius: 12,
            },
            Button: {
              borderRadius: 12,
              primaryShadow: '0 4px 12px rgba(245, 166, 35, 0.3)',
              fontWeight: 500,
            },
            Card: {
              borderRadius: 16,
              boxShadow: '0 2px 12px rgba(245, 166, 35, 0.08)',
              paddingLG: 24,
            },
            Input: {
              borderRadius: 12,
              activeBorderColor: '#F5A623',
              hoverBorderColor: '#F7B731',
            },
            Table: {
              borderRadius: 12,
              headerBg: '#FFF4E6',
              headerColor: '#8B4513',
            },
          },
        }}
      >
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="locations" element={<LocationsPage />} />
                <Route path="promotions" element={<PromotionsPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="integrations" element={<IntegrationsPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
  );
}

export default App;

