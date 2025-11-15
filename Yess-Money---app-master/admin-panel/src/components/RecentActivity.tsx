import { Card, List, Avatar, Tag, Empty } from 'antd';
import {
  UserAddOutlined,
  ShopOutlined,
  GiftOutlined,
  TransactionOutlined,
  CheckCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/hooks/useTranslation';

interface Activity {
  id: string;
  type: 'user' | 'partner' | 'promotion' | 'transaction' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'failed';
}

interface RecentActivityProps {
  activities?: Activity[];
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'user':
      return <UserAddOutlined style={{ color: '#689071' }} />;
    case 'partner':
      return <ShopOutlined style={{ color: '#689071' }} />;
    case 'promotion':
      return <GiftOutlined style={{ color: '#689071' }} />;
    case 'transaction':
      return <TransactionOutlined style={{ color: '#689071' }} />;
    case 'notification':
      return <BellOutlined style={{ color: '#689071' }} />;
    default:
      return <CheckCircleOutlined style={{ color: '#689071' }} />;
  }
};

const getStatusColor = (status?: Activity['status']) => {
  switch (status) {
    case 'success':
      return '#689071';
    case 'pending':
      return '#AEC380';
    case 'failed':
      return '#ff4d4f';
    default:
      return '#689071';
  }
};

export const RecentActivity = ({ activities = [] }: RecentActivityProps) => {
  const { t } = useTranslation();
  
  const defaultActivities: Activity[] = [
    {
      id: '1',
      type: 'user',
      title: t('activity.newUser', 'Новый пользователь'),
      description: t('activity.userRegistered', 'Пользователь "Иван Иванов" зарегистрирован'),
      timestamp: t('activity.minutesAgo', '5 минут назад', { count: 5 }),
      status: 'success',
    },
    {
      id: '2',
      type: 'promotion',
      title: t('activity.promotionCreated', 'Акция создана'),
      description: t('activity.promotionPublished', 'Акция "Скидка 20%" опубликована'),
      timestamp: t('activity.hourAgo', '1 час назад', { count: 1 }),
      status: 'success',
    },
    {
      id: '3',
      type: 'partner',
      title: t('activity.partnerAdded', 'Партнер добавлен'),
      description: t('activity.partnerAddedDesc', 'Партнер "Глобус" добавлен в систему'),
      timestamp: t('activity.hoursAgo', '2 часа назад', { count: 2 }),
      status: 'success',
    },
    {
      id: '4',
      type: 'transaction',
      title: t('activity.transactionProcessed', 'Транзакция обработана'),
      description: t('activity.transactionAmount', 'Транзакция на сумму 10,000 сом'),
      timestamp: t('activity.hoursAgo', '3 часа назад', { count: 3 }),
      status: 'success',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <Card
      title={<span style={{ color: '#0F2A1D', fontSize: 16, fontWeight: 700 }}>{t('activity.recentActivity', '📋 Последняя активность')}</span>}
      style={{
        borderRadius: 16,
        background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
        border: '1px solid #E3EED4',
        boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
      }}
      className="hover-lift-green"
    >
      {displayActivities.length === 0 ? (
        <Empty description={t('activity.noActivity', 'Нет активности')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={displayActivities}
          renderItem={(item) => (
            <List.Item
              style={{
                border: 'none',
                padding: '12px 0',
                borderBottom: '1px solid #E3EED4',
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={getActivityIcon(item.type)}
                    style={{
                      backgroundColor: '#F0F7EB',
                      border: `2px solid ${getStatusColor(item.status)}`,
                    }}
                  />
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: '#0F2A1D' }}>{item.title}</span>
                    {item.status && (
                      <Tag color={getStatusColor(item.status)} style={{ margin: 0 }}>
                        {item.status === 'success' ? t('activity.success', 'Успешно') : item.status === 'pending' ? t('activity.pending', 'В процессе') : t('activity.failed', 'Ошибка')}
                      </Tag>
                    )}
                  </div>
                }
                description={
                  <div>
                    <div style={{ color: '#689071', fontSize: 13 }}>{item.description}</div>
                    <div style={{ color: '#AEC380', fontSize: 11, marginTop: 4 }}>
                      {item.timestamp}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

