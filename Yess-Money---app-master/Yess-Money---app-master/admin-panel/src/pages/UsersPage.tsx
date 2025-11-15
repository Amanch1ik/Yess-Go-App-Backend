import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Card, Input, Button, Tag, Space, Modal, message, Avatar } from 'antd';
import { SearchOutlined, UserOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { usersApi } from '@/services/api';
import { User } from '@/types';
import { Link } from 'react-router-dom';

export const UsersPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersApi.getAll({ page, limit: 20, search }).then(res => res.data),
  });

  const blockMutation = useMutation({
    mutationFn: (userId: number) => usersApi.block(userId),
    onSuccess: () => {
      message.success('Пользователь заблокирован');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (userId: number) => usersApi.unblock(userId),
    onSuccess: () => {
      message.success('Пользователь разблокирован');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleBlock = (user: User) => {
    Modal.confirm({
      title: 'Заблокировать пользователя?',
      content: `Вы уверены, что хотите заблокировать ${user.name}?`,
      onOk: () => blockMutation.mutate(user.id),
    });
  };

  const handleUnblock = (user: User) => {
    Modal.confirm({
      title: 'Разблокировать пользователя?',
      content: `Вы уверены, что хотите разблокировать ${user.name}?`,
      onOk: () => unblockMutation.mutate(user.id),
    });
  };

  const columns = [
    {
      title: 'Аватар',
      dataIndex: 'avatar_url',
      key: 'avatar',
      render: (url: string, record: User) => (
        <Avatar src={url} icon={<UserOutlined />}>{record.name[0]}</Avatar>
      ),
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: User) => (
        <Link to={`/users/${record.id}`}>{name}</Link>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Верификация',
      key: 'verification',
      render: (_: any, record: User) => (
        <Space>
          {record.phone_verified && <Tag color="green">Телефон</Tag>}
          {record.email_verified && <Tag color="blue">Email</Tag>}
        </Space>
      ),
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_: any, record: User) => {
        if (record.is_blocked) return <Tag color="red">Заблокирован</Tag>;
        if (record.is_active) return <Tag color="green">Активен</Tag>;
        return <Tag color="default">Неактивен</Tag>;
      },
    },
    {
      title: 'Регистрация',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Link to={`/users/${record.id}`}>
            <Button size="small">Открыть</Button>
          </Link>
          {record.is_blocked ? (
            <Button
              size="small"
              icon={<UnlockOutlined />}
              onClick={() => handleUnblock(record)}
            >
              Разблокировать
            </Button>
          ) : (
            <Button
              size="small"
              danger
              icon={<LockOutlined />}
              onClick={() => handleBlock(record)}
            >
              Заблокировать
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Управление пользователями"
      extra={
        <Input
          placeholder="Поиск по имени, email или телефону"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
      }
    >
      <Table
        columns={columns}
        dataSource={data?.users || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: 20,
          total: data?.total || 0,
          onChange: setPage,
        }}
      />
    </Card>
  );
};
