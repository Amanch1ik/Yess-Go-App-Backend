<<<<<<< HEAD
import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Select, Input, DatePicker, Spin, message, Dropdown } from 'antd';
import { PlusOutlined, DownloadOutlined, ExportOutlined } from '@ant-design/icons';
import { DeleteButton } from '../components/DeleteButton';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../services/api';
import { exportToCSV, exportToExcel, exportToJSON } from '../utils/exportUtils';
=======
import { Card, Table, Tag, Button, Space, Select, Input, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DeleteButton } from '../components/DeleteButton';
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

const { RangePicker } = DatePicker;

const transactionsData = [
  {
    key: '1',
    date: '20.10.2025 14:29',
    user: { name: 'Peter Taylor', avatar: null },
    partner: { name: 'Глобус', logo: 'Fresh' },
    amount: 2000,
    type: 'Начисление',
    status: 'Успешно',
  },
  {
    key: '2',
    date: '20.10.2025 14:29',
    user: { name: 'Szekeres Dalma', avatar: null },
    partner: { name: 'Глобус', logo: 'Supermarket' },
    amount: -200,
    type: 'Начисление',
    status: 'Успешно',
  },
  {
    key: '3',
    date: '20.10.2025 14:29',
    user: { name: 'Peter Taylor', avatar: null },
    partner: { name: 'Глобус', logo: 'Dover' },
    amount: 15000,
    type: 'На проверке',
    status: 'Успешно',
  },
  {
    key: '4',
    date: '20.10.2025 14:29',
    user: { name: 'Szekeres Dalma', avatar: null },
    partner: { name: 'Глобус', logo: 'Fresh' },
    amount: 490,
    type: 'Начисление',
    status: 'Успешно',
  },
  {
    key: '5',
    date: '20.10.2025 14:29',
    user: { name: 'Peter Taylor', avatar: null },
    partner: { name: 'Глобус', logo: 'Supermarket' },
    amount: -2000,
    type: 'Начисление',
    status: 'Успешно',
  },
];

export const TransactionsPage = () => {
<<<<<<< HEAD
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Загрузка транзакций из API
  const { data: transactionsResponse, isLoading } = useQuery({
    queryKey: ['transactions', dateRange],
    queryFn: async () => {
      try {
        const params: any = {};
        if (dateRange) {
          params.start_date = dateRange[0].format('YYYY-MM-DD');
          params.end_date = dateRange[1].format('YYYY-MM-DD');
        }
        const response = await transactionsApi.getTransactions(params);
        return response.data;
      } catch (err: any) {
        console.warn('Transactions API недоступен, используем моковые данные:', err);
        return transactionsData;
      }
    },
    retry: 1,
  });

  // Используем данные из API или моковые
  const allTransactions = transactionsResponse || transactionsData;

  const handleExport = (format: 'csv' | 'excel' | 'json' = 'csv') => {
    // Проверяем, что есть данные для экспорта
    if (!allTransactions || allTransactions.length === 0) {
      message.warning('Нет данных для экспорта');
      return;
    }

    const exportColumns = [
      { 
        key: 'date', 
        title: 'Дата',
        render: (val: string) => val || ''
      },
      { 
        key: 'user', 
        title: 'Пользователь',
        render: (val: any, record: any) => record.user?.name || ''
      },
      { 
        key: 'partner', 
        title: 'Партнер',
        render: (val: any, record: any) => record.partner?.name || ''
      },
      { 
        key: 'amount', 
        title: 'Сумма',
        render: (val: number) => `${val > 0 ? '+' : ''}${val.toLocaleString('ru-RU')} Yess!Coin`
      },
      { 
        key: 'type', 
        title: 'Тип',
        render: (val: string) => val || ''
      },
      { 
        key: 'status', 
        title: 'Статус',
        render: (val: string) => val || ''
      },
    ];

    try {
      if (format === 'csv') {
        exportToCSV(allTransactions, exportColumns, 'transactions');
        message.success('Файл успешно загружен');
      } else if (format === 'excel') {
        exportToExcel(allTransactions, exportColumns, 'transactions');
        message.success('Файл успешно загружен');
      } else {
        exportToJSON(allTransactions, 'transactions');
        message.success('Файл успешно загружен');
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Ошибка при экспорте данных');
    }
  };

  const exportMenuItems = [
    { key: 'csv', label: 'Экспорт в CSV', onClick: () => handleExport('csv') },
    { key: 'excel', label: 'Экспорт в Excel', onClick: () => handleExport('excel') },
    { key: 'json', label: 'Экспорт в JSON', onClick: () => handleExport('json') },
  ];

=======
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
  const columns = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      sorter: true,
    },
    {
      title: 'Пользователь',
      key: 'user',
      sorter: true,
      render: (_: any, record: any) => (
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#689071',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 600,
            }}
          >
            {record.user.name.charAt(0)}
          </div>
          <span>{record.user.name}</span>
        </Space>
      ),
    },
    {
      title: 'Партнер',
      key: 'partner',
      sorter: true,
      render: (_: any, record: any) => (
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
<<<<<<< HEAD
              background: '#F0F7EB',
=======
              background: '#E3EED4',
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#689071',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {record.partner.logo.charAt(0)}
          </div>
          <span>{record.partner.name}</span>
        </Space>
      ),
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      sorter: true,
      render: (amount: number) => (
        <span style={{ color: amount > 0 ? '#689071' : '#ff4d4f', fontWeight: 600 }}>
<<<<<<< HEAD
          {amount > 0 ? '+' : ''}{amount.toLocaleString()} Yess!Coin
=======
          {amount > 0 ? '+' : ''}{amount.toLocaleString()} Y
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
        </span>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      sorter: true,
      render: (type: string) => (
<<<<<<< HEAD
        <Tag color={type === 'Начисление' ? 'green' : 'blue'}>{type}</Tag>
=======
        <Tag color={type === 'Начисление' ? 'green' : 'orange'}>{type}</Tag>
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (status: string) => (
        <Tag color="green">{status}</Tag>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
<<<<<<< HEAD
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#0F2A1D', background: 'linear-gradient(135deg, #0F2A1D 0%, #689071 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          💳 Транзакции
        </h1>
        <Dropdown
          menu={{ items: exportMenuItems }}
          trigger={['click']}
        >
          <Button
            type="primary"
            icon={<ExportOutlined />}
            style={{
              background: 'linear-gradient(135deg, #689071 0%, #AEC380 100%)',
              border: 'none',
              borderRadius: 12,
              height: 40,
              fontWeight: 600,
            }}
          >
            Экспорт
          </Button>
        </Dropdown>
=======
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#8B4513' }}>
          💳 Транзакции
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            background: 'linear-gradient(135deg, #F5A623 0%, #F7B731 100%)',
            border: 'none',
            borderRadius: 12,
            height: 40,
            fontWeight: 600,
          }}
        >
          Скачать отчет
        </Button>
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
      </div>

      <Card
        style={{
          borderRadius: 16,
<<<<<<< HEAD
          background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
          border: '1px solid #E3EED4',
          marginBottom: 16,
          boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
=======
          background: 'linear-gradient(135deg, #ffffff 0%, #FFF4E6 100%)',
          border: '1px solid #FFE6CC',
          marginBottom: 16,
          boxShadow: '0 2px 12px rgba(245, 166, 35, 0.08)',
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
        }}
      >
        <Space wrap style={{ width: '100%' }}>
          <RangePicker
<<<<<<< HEAD
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
=======
            defaultValue={[dayjs('2025-11-01'), dayjs('2026-11-01')]}
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
            format="DD.MM.YYYY"
            style={{ borderRadius: 12 }}
          />
          <Select
            defaultValue="Начисление"
            style={{ width: 200, borderRadius: 12 }}
            options={[
              { label: 'Начисление', value: 'Начисление' },
              { label: 'Списание', value: 'Списание' },
            ]}
          />
          <Select
            defaultValue="Супермаркет №1"
            style={{ width: 200, borderRadius: 12 }}
            options={[
              { label: 'Супермаркет №1', value: 'Супермаркет №1' },
            ]}
          />
          <Input
            placeholder="Сотрудник"
            defaultValue="Актан Ж."
            style={{ width: 200, borderRadius: 12 }}
          />
        </Space>
      </Card>

      <Card
        style={{
          borderRadius: 16,
<<<<<<< HEAD
          background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
          border: '1px solid #E3EED4',
          boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
        }}
      >
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={allTransactions}
            pagination={{ pageSize: 10 }}
            rowClassName={() => 'partner-table-row'}
            loading={isLoading}
          />
        )}
=======
          background: 'linear-gradient(135deg, #ffffff 0%, #FFF4E6 100%)',
          border: '1px solid #FFE6CC',
          boxShadow: '0 2px 12px rgba(245, 166, 35, 0.08)',
        }}
      >
        <Table
          columns={columns}
          dataSource={transactionsData}
          pagination={{ pageSize: 10 }}
          rowClassName={() => 'partner-table-row'}
        />
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
      </Card>

      <style>{`
        .partner-table-row {
          transition: all 0.3s;
        }
        .partner-table-row:hover {
<<<<<<< HEAD
          background-color: #F0F7EB !important;
=======
          background-color: #FFF4E6 !important;
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
        }
      `}</style>
    </div>
  );
};

