import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const routeNames: Record<string, string> = {
  '': 'Дашборд',
  users: 'Пользователи',
  partners: 'Партнеры',
  transactions: 'Транзакции',
  orders: 'Заказы',
  notifications: 'Уведомления',
  achievements: 'Достижения',
  promotions: 'Акции',
  analytics: 'Аналитика',
  settings: 'Настройки',
};

export const PageHeader = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(Boolean);

  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeOutlined />
        </Link>
      ),
    },
    ...pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const isLast = index === pathSnippets.length - 1;

      return {
        title: isLast ? (
          <span>{routeNames[snippet] || snippet}</span>
        ) : (
          <Link to={url}>{routeNames[snippet] || snippet}</Link>
        ),
      };
    }),
  ];

  return <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />;
};
