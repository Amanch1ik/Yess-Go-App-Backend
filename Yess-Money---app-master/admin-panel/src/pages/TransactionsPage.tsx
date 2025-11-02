import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Card, Tag, Select, Space, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { transactionsApi } from '@/services/api';
import dayjs from 'dayjs';

export const TransactionsPage = () => {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<string>();
  const [status, setStatus] = useState<string>();

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, type, status],
    queryFn: () => transactionsApi.getAll({ page, limit: 20, type, status }).then(res => res.data),
  });

  const handleExport = () => {
    console.log('Export transactions');
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Пользователь',
      dataIndex: 'user_id',
      key: 'user_id',
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colors: Record<string, string> = {
          topup: 'green',
          discount: 'blue',
          bonus: 'orange',
          refund: 'red',
        };
        const labels: Record<string, string> = {
          topup: 'Пополнение',
          discount: 'Скидка',
          bonus: 'Бонус',
          refund: 'Возврат',
        };
        return <Tag color={colors[type]}>{labels[type] || type}</Tag>;
      },
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount.toFixed(2)} сом`,
    },
    {
      title: 'Баланс до',
      dataIndex: 'balance_before',
      key: 'balance_before',
      render: (balance: number) => `${balance?.toFixed(2) || 0} сом`,
    },
    {
      title: 'Баланс после',
      dataIndex: 'balance_after',
      key: 'balance_after',
      render: (balance: number) => `${balance?.toFixed(2) || 0} сом`,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          completed: 'success',
          pending: 'processing',
          failed: 'error',
        };
        const labels: Record<string, string> = {
          completed: 'Завершено',
          pending: 'В обработке',
          failed: 'Ошибка',
        };
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
      },
    },
    {
      title: 'Создано',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Завершено',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-',
    },
  ];

  return (
    <Card
      title="Транзакции"
      extra={
        <Space>
          <Select
            placeholder="Тип"
            style={{ width: 150 }}
            allowClear
            value={type}
            onChange={setType}
            options={[
              { label: 'Пополнение', value: 'topup' },
              { label: 'Скидка', value: 'discount' },
              { label: 'Бонус', value: 'bonus' },
              { label: 'Возврат', value: 'refund' },
            ]}
          />
          <Select
            placeholder="Статус"
            style={{ width: 150 }}
            allowClear
            value={status}
            onChange={setStatus}
            options={[
              { label: 'Завершено', value: 'completed' },
              { label: 'В обработке', value: 'pending' },
              { label: 'Ошибка', value: 'failed' },
            ]}
          />
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Экспорт
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={data?.transactions || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: 20,
          total: data?.total || 0,
          onChange: setPage,
        }}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};
