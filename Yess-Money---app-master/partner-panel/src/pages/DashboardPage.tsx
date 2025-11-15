import { Card, Row, Col, Statistic, Button, Space, Progress, Tag, Spin, message } from 'antd';
import {
  DollarOutlined,
  LineChartOutlined,
  PlusOutlined,
  UserAddOutlined,
  AreaChartOutlined,
  TrophyOutlined,
  TeamOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { QuickActions } from '../components/QuickActions';
import { RecentActivity } from '../components/RecentActivity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../services/api';
import { connectWebSocket, wsService } from '../services/websocket';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { queryKeys } from '@/config/queryClient';

const salesData = [
  { date: '29 май', value: 220342.76 },
  { date: '30 май', value: 180234.12 },
  { date: '31 май', value: 250123.45 },
  { date: '1 июн', value: 210456.78 },
  { date: '2 июн', value: 190234.56 },
  { date: '3 июн', value: 230567.89 },
  { date: '4 июн', value: 245890.12 },
];

const categoryData = [
  { name: 'Продукты', value: 35, color: '#689071' },
  { name: 'Кафе', value: 25, color: '#AEC380' },
  { name: 'Одежда', value: 20, color: '#E3EED4' },
  { name: 'Другое', value: 20, color: '#375534' },
];

// Анимация для карточек
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  })
};

export const DashboardPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // WebSocket интеграция для реал-тайм обновлений
  useEffect(() => {
    // Проверяем, включен ли WebSocket
    const wsEnabled = import.meta.env.VITE_WS_ENABLED !== 'false';
    if (!wsEnabled) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws';
    
    // Подключаемся к WebSocket только если он не был отключен ранее
    if (!wsService.hasConnectionFailed()) {
      connectWebSocket(wsUrl);
    }
    
    // Подписка на обновления транзакций
    const unsubscribeTransactions = wsService.on('transaction', (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    });
    
    // Подписка на обновления промо-акций
    const unsubscribePromotions = wsService.on('promotion_update', (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    });
    
    // Подписка на обновления локаций
    const unsubscribeLocations = wsService.on('location_update', (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    });
    
    // Подписка на уведомления
    const unsubscribeNotifications = wsService.on('notification', (data) => {
      console.log('New notification:', data);
    });
    
    return () => {
      unsubscribeTransactions();
      unsubscribePromotions();
      unsubscribeLocations();
      unsubscribeNotifications();
    };
  }, [queryClient]);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: async () => {
      try {
        const response = await dashboardApi.getStats();
        return response.data;
      } catch (err: any) {
        // Если API недоступен, используем моковые данные
        console.warn('Dashboard API недоступен, используем моковые данные:', err);
        return null;
      }
    },
    // Оптимизированные настройки кэширования
    staleTime: 2 * 60 * 1000, // 2 минуты для дашборда (более частое обновление)
    gcTime: 5 * 60 * 1000, // 5 минут кэш
    refetchInterval: 30000, // Обновляем каждые 30 секунд
    retry: 1,
  });

  // Используем реальные данные или моковые
  const sales = stats?.total_sales || 10325;
  const avgCheck = stats?.avg_check || 750;
  const coinsIssued = stats?.coins_issued || 6.4;
  const customers = stats?.total_customers || 1248;
  const salesGrowth = stats?.sales_growth || 12;
  const checkGrowth = stats?.check_growth || 8;
  const coinsGrowth = stats?.coins_growth || 24;
  const customersGrowth = stats?.customers_growth || 15;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32 
      }}>
        <div>
          <h1 style={{ 
            fontSize: 32, 
            fontWeight: 700, 
            margin: 0, 
            color: '#217A44', 
            background: 'linear-gradient(135deg, #37946e 0%, #69bb7b 50%, #bee3b6 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            backgroundClip: 'text' 
          }}>
            {t('dashboard.title', '📊 Главная')}
          </h1>
          <p style={{ color: '#37946e', margin: '8px 0 0 0', fontSize: 14, fontWeight: 500 }}>
            {t('dashboard.subtitle', 'Обзор вашей деятельности и статистика')}
          </p>
        </div>
        <Space>
          <Button 
            type="default" 
            size="large"
            onClick={() => navigate('/transactions')}
            style={{
              borderRadius: 12,
              borderColor: '#37946e',
              color: '#37946e',
            }}
          >
            {t('common.export', '📥 Экспорт')}
          </Button>
        </Space>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card
              hoverable
              className="hover-lift-green scale-in animate-delay-100"
              style={{
                borderRadius: 16,
                background: 'linear-gradient(135deg, #ffffff 0%, #e3eed4 100%)',
                border: '1px solid #bee3b6',
                boxShadow: '0 2px 12px rgba(55,148,110,0.08)',
                transition: 'all 0.3s',
              }}
            >
              <Statistic
              title={<span style={{ color: '#37946e', fontWeight: 500 }}>{t('dashboard.sales', '💰 Продажи')}</span>}
              value={sales}
              suffix=" сом"
              valueStyle={{ color: '#217A44', fontWeight: 700, fontSize: 28 }}
              prefix={<DollarOutlined style={{ color: '#37946e', fontSize: 20 }} />}
            />
            <div style={{ fontSize: 12, color: '#37946e', marginTop: 8, fontWeight: 500 }}>
              <RiseOutlined /> ↑ {salesGrowth}% {t('dashboard.vsLastMonth', 'vs прошлый месяц')}
            </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card
              hoverable
              className="hover-lift-green scale-in animate-delay-200"
              style={{
                borderRadius: 16,
                background: 'linear-gradient(135deg, #ffffff 0%, #e3eed4 100%)',
                border: '1px solid #bee3b6',
                boxShadow: '0 2px 12px rgba(55,148,110,0.08)',
                transition: 'all 0.3s',
              }}
            >
              <Statistic
                title={<span style={{ color: '#37946e', fontWeight: 500 }}>{t('dashboard.averageCheck', '📈 Средний чек')}</span>}
                value={avgCheck}
                suffix=" сом"
                valueStyle={{ color: '#217A44', fontWeight: 700, fontSize: 28 }}
                prefix={<LineChartOutlined style={{ color: '#37946e', fontSize: 20 }} />}
              />
              <div style={{ fontSize: 12, color: '#37946e', marginTop: 8, fontWeight: 500 }}>
                <RiseOutlined /> ↑ {checkGrowth}% {t('dashboard.vsLastMonth', 'vs прошлый месяц')}
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card
              hoverable
              className="hover-lift-green scale-in animate-delay-300"
              style={{
                borderRadius: 16,
                background: 'linear-gradient(135deg, #ffffff 0%, #e3eed4 100%)',
                border: '1px solid #bee3b6',
                boxShadow: '0 2px 12px rgba(55,148,110,0.08)',
                transition: 'all 0.3s',
              }}
            >
              <Statistic
                title={<span style={{ color: '#37946e', fontWeight: 500 }}>{t('dashboard.coinsEarned', '⭐ Начислено Yess!Coin')}</span>}
                value={coinsIssued}
                suffix=" млн"
                valueStyle={{ color: '#217A44', fontWeight: 700, fontSize: 28 }}
                prefix={<TrophyOutlined style={{ color: '#37946e', fontSize: 20 }} />}
              />
              <div style={{ fontSize: 12, color: '#37946e', marginTop: 8, fontWeight: 500 }}>
                <RiseOutlined /> ↑ {coinsGrowth}% {t('dashboard.vsLastMonth', 'vs прошлый месяц')}
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card
              hoverable
              className="hover-lift-green scale-in animate-delay-400"
              style={{
                borderRadius: 16,
                background: 'linear-gradient(135deg, #ffffff 0%, #e3eed4 100%)',
                border: '1px solid #bee3b6',
                boxShadow: '0 2px 12px rgba(55,148,110,0.08)',
                transition: 'all 0.3s',
              }}
            >
              <Statistic
                title={<span style={{ color: '#37946e', fontWeight: 500 }}>👥 {t('dashboard.customers', 'Клиенты')}</span>}
                value={customers}
                valueStyle={{ color: '#217A44', fontWeight: 700, fontSize: 28 }}
                prefix={<TeamOutlined style={{ color: '#37946e', fontSize: 20 }} />}
              />
              <div style={{ fontSize: 12, color: '#37946e', marginTop: 8, fontWeight: 500 }}>
                <RiseOutlined /> ↑ {customersGrowth}% {t('dashboard.vsLastMonth', 'vs прошлый месяц')}
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AreaChartOutlined style={{ color: '#37946e', fontSize: 20 }} />
                  <span style={{ fontWeight: 700, color: '#217A44', fontSize: 18 }}>{t('dashboard.salesByDays', 'Продажи по дням')}</span>
                </div>
                <Tag color="#37946e" style={{ fontSize: 14, padding: '4px 12px' }}>
                  {t('dashboard.last7Days', 'Последние 7 дней')}
                </Tag>
              </div>
            }
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #e3eed4 100%)',
              border: '1px solid #bee3b6',
              marginBottom: 32,
              boxShadow: '0 2px 12px rgba(55,148,110,0.08)',
            }}
            className="hover-lift-green"
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#37946e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#bee3b6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3eed4" />
                <XAxis dataKey="date" stroke="#217A44" />
                <YAxis stroke="#217A44" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #bee3b6',
                    background: '#ffffff',
                    boxShadow: '0 4px 12px rgba(55,148,110,0.15)',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#37946e" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  dot={{ fill: '#37946e', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrophyOutlined style={{ color: '#37946e', fontSize: 20 }} />
                <span style={{ fontWeight: 700, color: '#217A44', fontSize: 18 }}>{t('dashboard.byCategories', 'По категориям')}</span>
              </div>
            }
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #e3eed4 100%)',
              border: '1px solid #bee3b6',
              boxShadow: '0 2px 12px rgba(55,148,110,0.08)',
            }}
            className="hover-lift-green"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={16}>
          <QuickActions />
        </Col>
        <Col xs={24} lg={8}>
          <RecentActivity />
        </Col>
      </Row>
    </div>
  );
};
