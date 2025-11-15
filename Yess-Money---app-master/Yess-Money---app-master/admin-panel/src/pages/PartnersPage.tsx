import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Card, Input, Button, Tag, Space, Modal, message, Avatar } from 'antd';
import { SearchOutlined, ShopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { partnersApi } from '@/services/api';
import { Partner } from '@/types';
import { Link } from 'react-router-dom';

export const PartnersPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['partners', page, search],
    queryFn: () => partnersApi.getAll({ page, limit: 20, search }).then(res => res.data),
  });

  const verifyMutation = useMutation({
    mutationFn: (partnerId: number) => partnersApi.verify(partnerId),
    onSuccess: () => {
      message.success('Партнер верифицирован');
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });

  const handleVerify = (partner: Partner) => {
    Modal.confirm({
      title: 'Верифицировать партнера?',
      content: `Вы уверены, что хотите верифицировать ${partner.name}?`,
      onOk: () => verifyMutation.mutate(partner.id),
    });
  };

  const columns = [
    {
      title: 'Лого',
      dataIndex: 'logo_url',
      key: 'logo',
      render: (url: string, record: Partner) => (
        <Avatar src={url} icon={<ShopOutlined />} shape="square">{record.name[0]}</Avatar>
      ),
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Partner) => (
        <Link to={`/partners/${record.id}`}>{name}</Link>
      ),
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag>{category}</Tag>,
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Скидка',
      dataIndex: 'max_discount_percent',
      key: 'discount',
      render: (discount: number) => `${discount}%`,
    },
    {
      title: 'Кэшбэк',
      dataIndex: 'cashback_rate',
      key: 'cashback',
      render: (cashback: number) => `${cashback}%`,
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_: any, record: Partner) => (
        <Space direction="vertical" size="small">
          {record.is_verified ? (
            <Tag color="green">Верифицирован</Tag>
          ) : (
            <Tag color="orange">Не верифицирован</Tag>
          )}
          {record.is_active ? (
            <Tag color="blue">Активен</Tag>
          ) : (
            <Tag color="default">Неактивен</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Partner) => (
        <Space>
          <Link to={`/partners/${record.id}`}>
            <Button size="small">Открыть</Button>
          </Link>
          {!record.is_verified && (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleVerify(record)}
            >
              Верифицировать
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Управление партнерами"
      extra={
        <Input
          placeholder="Поиск по названию или категории"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
      }
    >
      <Table
        columns={columns}
        dataSource={data?.partners || []}
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
