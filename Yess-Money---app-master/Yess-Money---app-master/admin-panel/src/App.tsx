import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MainLayout } from '@/components/MainLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UsersPage } from '@/pages/UsersPage';
import { PartnersPage } from '@/pages/PartnersPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { PromotionsPage } from '@/pages/PromotionsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { SettingsPage } from '@/pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={ruRU}
        theme={{
          token: {
            colorPrimary: '#37946e',
            borderRadius: 12,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            colorSuccess: '#52c41a',
            colorError: '#ff4d4f',
            colorWarning: '#faad14',
            colorInfo: '#1890ff',
          },
          components: {
            Menu: {
              itemSelectedBg: 'linear-gradient(135deg, #37946e 0%, #69bb7b 100%)',
              itemSelectedColor: '#ffffff',
              itemHoverBg: '#f4faf6',
              itemActiveBg: 'linear-gradient(135deg, #37946e 0%, #69bb7b 100%)',
              itemBorderRadius: 12,
            },
            Button: {
              borderRadius: 12,
              primaryShadow: '0 4px 12px rgba(55, 148, 110, 0.3)',
              fontWeight: 500,
            },
            Card: {
              borderRadius: 16,
              boxShadow: '0 2px 12px rgba(55, 148, 110, 0.08)',
              paddingLG: 24,
            },
            Input: {
              borderRadius: 12,
              activeBorderColor: '#37946e',
              hoverBorderColor: '#69bb7b',
            },
            Table: {
              borderRadius: 12,
              headerBg: '#f4faf6',
              headerColor: '#223732',
            },
          },
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/partners" element={<PartnersPage />} />
                      <Route path="/transactions" element={<TransactionsPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/promotions" element={<PromotionsPage />} />
                      <Route path="/orders" element={<div>Заказы</div>} />
                      <Route path="/achievements" element={<div>Достижения</div>} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
