import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Statistic, Select, DatePicker, Spin, Alert } from 'antd';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsApi, transactionsApi, usersApi, partnersApi } from '@/services/api';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import type { RangePickerProps } from 'antd/es/date-picker';

const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AnalyticsPage = () => {
  const [period, setPeriod] = useState('month');
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'month' | 'year'>('date');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);

  // Получаем статистику
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ['analytics-stats', period, dateRange],
    queryFn: async () => {
      try {
        const response = await analyticsApi.getDashboardStats();
        return response.data || response;
      } catch (error: any) {
        // Fallback на mock данные если API недоступен
        if (error?.response?.status === 404 || error?.code === 'ERR_NETWORK') {
          return {
            average_order: 750,
            conversion_rate: 12.5,
            retention_rate: 68.3,
            lifetime_value: 4500,
            total_users: 0,
            active_partners: 0,
            total_transactions: 0,
            total_revenue: 0,
          };
        }
        throw error;
      }
    },
    retry: 1,
  });

  // Получаем данные транзакций для графика динамики
  const { data: transactionsData } = useQuery({
    queryKey: ['analytics-transactions', dateRange],
    queryFn: async () => {
      try {
        const response = await transactionsApi.getAll(1, 1000);
        return response.data?.items || [];
      } catch (error: any) {
        return [];
      }
    },
    retry: 1,
  });

  // Обрабатываем данные транзакций для графика динамики
  const revenueTrend = (() => {
    if (!transactionsData || transactionsData.length === 0) {
      // Fallback на mock данные
      return [
        { date: '01.11', revenue: 125000, transactions: 340 },
        { date: '08.11', revenue: 142000, transactions: 420 },
        { date: '15.11', revenue: 158000, transactions: 480 },
        { date: '22.11', revenue: 175000, transactions: 550 },
        { date: '29.11', revenue: 192000, transactions: 620 },
      ];
    }

    // Группируем транзакции по датам
    const grouped = transactionsData.reduce((acc: any, transaction: any) => {
      const date = dayjs(transaction.created_at || transaction.date).format('DD.MM');
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, transactions: 0 };
      }
      acc[date].revenue += transaction.amount || 0;
      acc[date].transactions += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort((a: any, b: any) => 
      dayjs(a.date, 'DD.MM').unix() - dayjs(b.date, 'DD.MM').unix()
    );
  })();

  // Mock данные для графиков (будут заменены на реальные когда появятся соответствующие endpoints)
  const usersByCity = [
    { name: 'Бишкек', value: 4500 },
    { name: 'Ош', value: 1200 },
    { name: 'Джалал-Абад', value: 800 },
    { name: 'Каракол', value: 450 },
    { name: 'Токмок', value: 350 },
  ];

  const transactionTypes = (() => {
    if (!transactionsData || transactionsData.length === 0) {
      return [
        { name: 'Пополнение', value: 5200 },
        { name: 'Покупки', value: 3800 },
        { name: 'Бонусы', value: 1200 },
        { name: 'Возвраты', value: 320 },
      ];
    }

    // Группируем транзакции по типам
    const grouped = transactionsData.reduce((acc: any, transaction: any) => {
      const type = transaction.type || transaction.transaction_type || 'Другое';
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({ name, value: value as number }));
  })();

  const partnerPerformance = [
    { name: 'Супермаркет А', orders: 245, revenue: 78000 },
    { name: 'Кафе Б', orders: 189, revenue: 52000 },
    { name: 'Магазин В', orders: 156, revenue: 45000 },
    { name: 'Ресторан Г', orders: 134, revenue: 41000 },
    { name: 'Салон Д', orders: 98, revenue: 28000 },
  ];

  if (isLoadingStats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#0F2A1D', background: 'linear-gradient(135deg, #0F2A1D 0%, #689071 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          📊 Аналитика и отчеты
        </h1>
        <div style={{ display: 'flex', gap: 16 }}>
          <Select
            value={period}
            onChange={(value) => {
              setPeriod(value);
              if (value === 'year') {
                setDatePickerMode('year');
              } else if (value === 'quarter' || value === 'month') {
                setDatePickerMode('month');
              } else {
                setDatePickerMode('date');
              }
            }}
            style={{ width: 150 }}
            options={[
              { label: 'Неделя', value: 'week' },
              { label: 'Месяц', value: 'month' },
              { label: 'Квартал', value: 'quarter' },
              { label: 'Год', value: 'year' },
            ]}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
            format={datePickerMode === 'year' ? 'YYYY' : datePickerMode === 'month' ? 'MM.YYYY' : 'DD.MM.YYYY'}
            picker={datePickerMode}
            showTime={false}
          />
        </div>
      </div>

      {statsError && (
        <Alert
          message="Не удалось загрузить данные"
          description="Используются демонстрационные данные. Проверьте подключение к API."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
              border: '1px solid #E3EED4',
              boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
            }}
          >
            <Statistic
              title="Средний чек"
              value={stats?.average_order || stats?.average_check || 0}
              suffix="сом"
              valueStyle={{ color: '#689071', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
              border: '1px solid #E3EED4',
              boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
            }}
          >
            <Statistic
              title="Конверсия"
              value={stats?.conversion_rate || 0}
              suffix="%"
              valueStyle={{ color: '#689071', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
              border: '1px solid #E3EED4',
              boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
            }}
          >
            <Statistic
              title="Retention"
              value={stats?.retention_rate || 0}
              suffix="%"
              valueStyle={{ color: '#689071', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
              border: '1px solid #E3EED4',
              boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
            }}
          >
            <Statistic
              title="LTV"
              value={stats?.lifetime_value || 0}
              suffix="сом"
              valueStyle={{ color: '#689071', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="Динамика оборота и транзакций"
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
              border: '1px solid #E3EED4',
              boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
            }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Оборот (сом)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="transactions"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Транзакции"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="Распределение пользователей"
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
              border: '1px solid #E3EED4',
              boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
            }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={usersByCity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {usersByCity.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card 
            title="Топ партнеров"
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
              border: '1px solid #E3EED4',
              boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={partnerPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#8884d8" name="Заказы" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Оборот (сом)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Типы транзакций"
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
              border: '1px solid #E3EED4',
              boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionTypes.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
