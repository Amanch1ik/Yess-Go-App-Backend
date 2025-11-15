import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  TransactionOutlined,
  ShoppingOutlined,
  BellOutlined,
  TrophyOutlined,
  GiftOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Дашборд</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link to="/users">Пользователи</Link>,
    },
    {
      key: '/partners',
      icon: <ShopOutlined />,
      label: <Link to="/partners">Партнеры</Link>,
    },
    {
      key: '/transactions',
      icon: <TransactionOutlined />,
      label: <Link to="/transactions">Транзакции</Link>,
    },
    {
      key: '/orders',
      icon: <ShoppingOutlined />,
      label: <Link to="/orders">Заказы</Link>,
    },
    {
      key: '/notifications',
      icon: <BellOutlined />,
      label: <Link to="/notifications">Уведомления</Link>,
    },
    {
      key: '/achievements',
      icon: <TrophyOutlined />,
      label: <Link to="/achievements">Достижения</Link>,
    },
    {
      key: '/promotions',
      icon: <GiftOutlined />,
      label: <Link to="/promotions">Акции</Link>,
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: <Link to="/analytics">Аналитика</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Настройки</Link>,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Профиль',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Настройки',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Выход',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={250}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 16 : 20,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'YA' : 'YESS Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 500 }}>
            Панель управления
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Badge count={5}>
              <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.email}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px', minHeight: 'calc(100vh - 112px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
