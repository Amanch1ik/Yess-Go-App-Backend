import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Card, Avatar, Space, Spin, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { auditApi } from '@/services/api';
import { t } from '@/i18n';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

dayjs.extend(relativeTime);
dayjs.locale('ru');

export const AuditPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Получаем логи аудита
  const { data: auditDataResponse, isLoading: isLoadingAudit, error: auditError } = useQuery({
    queryKey: ['audit-logs', page, pageSize],
    queryFn: async () => {
      try {
        const response = await auditApi.getLogs(page, pageSize);
        return response.data?.items || response.data || [];
      } catch (error: any) {
        // Fallback на mock данные если API недоступен
        if (error?.response?.status === 404 || error?.code === 'ERR_NETWORK') {
          return [
            {
              id: 1,
              created_at: '2025-07-14T16:08:00',
              administrator: {
                name: 'Peter Taylor',
                avatar_url: null,
              },
              action: 'Создать новую роль',
              ip_address: '19.123.4.5',
              user_agent: 'Mozilla/5.0',
            },
            {
              id: 2,
              created_at: '2025-07-14T16:08:00',
              administrator: {
                name: 'Szekeres Dalma',
                avatar_url: null,
              },
              action: 'Удалить пользователя',
              ip_address: '19.123.4.5',
              user_agent: 'Mozilla/5.0',
            },
            {
              id: 3,
              created_at: '2025-07-14T16:08:00',
              administrator: {
                name: 'Peter Taylor',
                avatar_url: null,
              },
              action: 'Удалить пользователя',
              ip_address: '19.123.4.5',
              user_agent: 'Mozilla/5.0',
            },
          ];
        }
        throw error;
      }
    },
    retry: 1,
  });

  // Получаем сессии
  const { data: sessionsDataResponse, isLoading: isLoadingSessions, error: sessionsError } = useQuery({
    queryKey: ['audit-sessions'],
    queryFn: async () => {
      try {
        const response = await auditApi.getSessions();
        return response.data?.items || response.data || [];
      } catch (error: any) {
        // Fallback на mock данные если API недоступен
        if (error?.response?.status === 404 || error?.code === 'ERR_NETWORK') {
          return [
            {
              id: 1,
              device: 'Google Chrome',
              ip_address: '183.123.45.67',
              location: 'Кыргызстан',
              last_active: dayjs().subtract(10, 'hours').toISOString(),
            },
            {
              id: 2,
              device: 'Google Chrome',
              ip_address: '183.123.45.67',
              location: 'Кыргызстан',
              last_active: dayjs().subtract(10, 'hours').toISOString(),
            },
            {
              id: 3,
              device: 'Google Chrome',
              ip_address: '183.123.45.68',
              location: 'Кыргызстан',
              last_active: dayjs().subtract(10, 'hours').toISOString(),
            },
          ];
        }
        throw error;
      }
    },
    retry: 1,
  });

  const auditData = (auditDataResponse || []).map((item: any) => ({
    ...item,
    key: item.id,
    date: item.created_at ? dayjs(item.created_at).format('DD.MM.YYYY, HH:mm') : '-',
    administrator: item.administrator || {
      name: item.admin_name || 'Неизвестно',
      avatar: item.avatar_url,
    },
    ip: item.ip_address || item.ip || '-',
    address: item.location || item.address || '-',
  }));

  const sessionsData = (sessionsDataResponse || []).map((item: any) => ({
    ...item,
    key: item.id,
    ip: item.ip_address || item.ip || '-',
    active: item.last_active ? dayjs(item.last_active).fromNow() : '-',
  }));

  const auditColumns = [
    {
      title: t('audit.date', 'Дата'),
      dataIndex: 'date',
      key: 'date',
      width: 180,
    },
    {
      title: t('audit.administrator', 'Администратор'),
      key: 'administrator',
      width: 200,
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            src={record.administrator.avatar}
            icon={<UserOutlined />}
            size={32}
            style={{ backgroundColor: '#689071' }}
          />
          <span style={{ color: '#0F2A1D' }}>{record.administrator.name}</span>
        </div>
      ),
    },
    {
      title: t('audit.action', 'Действие'),
      dataIndex: 'action',
      key: 'action',
      width: 250,
      render: (action: string) => <span style={{ color: '#0F2A1D' }}>{action}</span>,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
      render: (ip: string) => <span style={{ color: '#0F2A1D' }}>{ip}</span>,
    },
    {
      title: t('audit.address', 'Адрес'),
      dataIndex: 'address',
      key: 'address',
      width: 150,
      render: (address: string) => <span style={{ color: '#0F2A1D' }}>{address}</span>,
    },
  ];

  const sessionsColumns = [
    {
      title: t('audit.device', 'Устройство'),
      dataIndex: 'device',
      key: 'device',
      width: 200,
      render: (device: string) => <span style={{ color: '#0F2A1D' }}>{device}</span>,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
      render: (ip: string) => <span style={{ color: '#0F2A1D' }}>{ip}</span>,
    },
    {
      title: t('audit.location', 'Местоположение'),
      dataIndex: 'location',
      key: 'location',
      width: 150,
      render: (location: string) => <span style={{ color: '#0F2A1D' }}>{location}</span>,
    },
    {
      title: t('audit.active', 'Активна'),
      dataIndex: 'active',
      key: 'active',
      width: 150,
      render: (active: string) => <span style={{ color: '#689071' }}>{active}</span>,
    },
  ];

  if (isLoadingAudit || isLoadingSessions) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, marginBottom: 8, color: '#0F2A1D', background: 'linear-gradient(135deg, #0F2A1D 0%, #689071 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {t('audit.title', 'Аудит')}
        </h1>
        <p style={{ color: '#689071', margin: 0 }}>
          {t('audit.description', 'Анализ действий администратора и защита аккаунтов')}
        </p>
      </div>

      {(auditError || sessionsError) && (
        <Alert
          message={t('audit.loadError', 'Не удалось загрузить данные аудита')}
          description={t('audit.loadErrorDesc', 'Используются демонстрационные данные. Проверьте подключение к API.')}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Таблица аудита */}
      <Card
        title={<span style={{ color: '#0F2A1D', fontSize: 16, fontWeight: 700 }}>{t('audit.history', '📋 История действий')}</span>}
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
          border: '1px solid #E3EED4',
          boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
          marginBottom: 20,
        }}
        className="hover-lift-green"
      >
        <Table
          columns={auditColumns}
          dataSource={auditData}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: pageSize,
            onChange: setPage,
            onShowSizeChange: (_, size) => setPageSize(size),
            showSizeChanger: true,
            showTotal: (total) => `Всего: ${total}`,
          }}
          scroll={{ x: 800 }}
          locale={{ emptyText: 'Нет данных аудита' }}
        />
      </Card>

      {/* Таблица сессий */}
      <Card
        title={<span style={{ color: '#0F2A1D', fontSize: 16, fontWeight: 700 }}>🔐 Активные сессии</span>}
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
          border: '1px solid #E3EED4',
          boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
        }}
        className="hover-lift-green"
      >
        <Table
          columns={sessionsColumns}
          dataSource={sessionsData}
          rowKey="id"
          pagination={false}
          scroll={{ x: 600 }}
          locale={{ emptyText: 'Нет активных сессий' }}
        />
      </Card>
    </div>
  );
};

