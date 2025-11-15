import { Card, Row, Col, Button } from 'antd';
import {
  UserAddOutlined,
  ShopOutlined,
  GiftOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

export const QuickActions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const actions = [
    {
      key: 'user',
      icon: <UserAddOutlined />,
      label: t('users.add', 'Добавить пользователя'),
      onClick: () => navigate('/users'),
      color: '#689071',
    },
    {
      key: 'partner',
      icon: <ShopOutlined />,
      label: t('partners.add', 'Добавить партнера'),
      onClick: () => navigate('/partners'),
      color: '#689071',
    },
    {
      key: 'promotion',
      icon: <GiftOutlined />,
      label: t('promotions.create', 'Создать акцию'),
      onClick: () => navigate('/promotions'),
      color: '#689071',
    },
    {
      key: 'report',
      icon: <FileTextOutlined />,
      label: t('common.exportReport', 'Скачать отчет'),
      onClick: () => navigate('/transactions'),
      color: '#689071',
    },
    {
      key: 'notification',
      icon: <BellOutlined />,
      label: t('notifications.send', 'Отправить уведомление'),
      onClick: () => navigate('/notifications'),
      color: '#689071',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('nav.settings', 'Настройки'),
      onClick: () => navigate('/settings'),
      color: '#689071',
    },
  ];

  return (
    <Card
      title={<span style={{ color: '#0F2A1D', fontSize: 16, fontWeight: 700 }}>{t('dashboard.quickActions', '⚡ Быстрые действия')}</span>}
      style={{
        borderRadius: 16,
        background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
        border: '1px solid #E3EED4',
        boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
      }}
      className="hover-lift-green"
    >
      <Row gutter={[12, 12]}>
        {actions.map((action) => (
          <Col xs={12} sm={8} md={6} key={action.key}>
            <Button
              type="default"
              onClick={action.onClick}
              block
              style={{
                height: 80,
                borderRadius: 12,
                borderColor: '#E3EED4',
                color: '#689071',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#689071';
                e.currentTarget.style.background = '#F0F7EB';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E3EED4';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: 20 }}>{action.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{action.label}</span>
            </Button>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

