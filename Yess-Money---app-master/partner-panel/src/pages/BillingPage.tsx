import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, Button, Table, Tag, Space, message, Spin, Modal, Form, InputNumber, DatePicker, Input } from 'antd';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import partnerApi from '@/services/partnerApi';
import { exportToCSV, exportToExcel, exportToJSON } from '@/utils/exportUtils';
import dayjs from 'dayjs';

export const BillingPage = () => {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceForm] = Form.useForm();

  // Получаем информацию о биллинге
  const { data: billingInfo, isLoading: isLoadingBilling } = useQuery({
    queryKey: ['partner-billing'],
    queryFn: async () => {
      try {
        const response = await partnerApi.getBillingInfo();
        return response.data;
      } catch (error: any) {
        // Fallback на mock данные если API недоступен
        if (error?.response?.status === 404 || error?.code === 'ERR_NETWORK') {
          return {
            plan: 'Базовый план',
            status: 'active',
            next_payment_date: dayjs().add(30, 'days').format('YYYY-MM-DD'),
          };
        }
        throw error;
      }
    },
    retry: 1,
  });

  // Получаем историю платежей
  const { data: billingHistory, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['partner-billing-history'],
    queryFn: async () => {
      try {
        const response = await partnerApi.getBillingHistory();
        return response.data?.items || response.data || [];
      } catch (error: any) {
        // Fallback на mock данные если API недоступен
        if (error?.response?.status === 404 || error?.code === 'ERR_NETWORK') {
          return [
            {
              id: '00124',
              invoice_number: 'INV-00124',
              date: '2025-10-15',
              amount: 10000,
              status: 'paid',
            },
            {
              id: '00123',
              invoice_number: 'INV-00123',
              date: '2025-10-15',
              amount: 10000,
              status: 'paid',
            },
            {
              id: '00122',
              invoice_number: 'INV-00122',
              date: '2025-10-15',
              amount: 10000,
              status: 'overdue',
            },
            {
              id: '00121',
              invoice_number: 'INV-00121',
              date: '2025-10-15',
              amount: 10000,
              status: 'paid',
            },
          ];
        }
        throw error;
      }
    },
    retry: 1,
  });

  // Мутация для создания счета
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await partnerApi.createInvoice(data);
    },
    onSuccess: () => {
      message.success('Счет успешно создан');
      setIsInvoiceModalOpen(false);
      invoiceForm.resetFields();
      refetchHistory();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Ошибка при создании счета');
    },
  });

  const handleCreateInvoice = async (values: any) => {
    try {
      await createInvoiceMutation.mutateAsync({
        amount: values.amount,
        due_date: values.due_date?.format('YYYY-MM-DD'),
        description: values.description,
      });
    } catch (error) {
      // Ошибка уже обработана в onError
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'json' = 'csv') => {
    if (!billingHistory || billingHistory.length === 0) {
      message.warning('Нет данных для экспорта');
      return;
    }

    const exportColumns = [
      { key: 'invoice_number', title: 'Номер счета' },
      { key: 'date', title: 'Дата' },
      { key: 'amount', title: 'Сумма', render: (val: number) => `${val.toLocaleString('ru-RU')} сом` },
      { key: 'status', title: 'Статус', render: (val: string) => val === 'paid' ? 'Оплачен' : 'Просрочен' },
    ];

    if (format === 'csv') {
      exportToCSV(billingHistory, exportColumns, 'billing-history');
      message.success('Файл успешно загружен');
    } else if (format === 'excel') {
      exportToExcel(billingHistory, exportColumns, 'billing-history');
      message.success('Файл успешно загружен');
    } else {
      exportToJSON(billingHistory, 'billing-history');
      message.success('Файл успешно загружен');
    }
  };

  const handleDownloadInvoice = (record: any) => {
    message.info(`Скачивание счета ${record.invoice_number || record.id}...`);
    // TODO: Реализовать скачивание PDF счета
  };

  if (isLoadingBilling || isLoadingHistory) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }
  const columns = [
    {
      title: '№',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (text: string, record: any) => text || record.id || '-',
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ fontWeight: 600 }}>{amount?.toLocaleString('ru-RU') || 0} сом</span>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          paid: { color: 'green', text: 'Оплачен' },
          overdue: { color: 'red', text: 'Просрочен' },
          pending: { color: 'orange', text: 'Ожидает оплаты' },
        };
        const statusInfo = statusMap[status] || { color: 'default', text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: 'Действие',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadInvoice(record)}
            title="Скачать счет"
          />
        </Space>
      ),
    },
  ];

  const paymentHistoryData = (billingHistory || []).map((item: any, index: number) => ({
    ...item,
    key: item.id || `invoice-${index}`,
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#0F2A1D', background: 'linear-gradient(135deg, #0F2A1D 0%, #689071 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          💳 Биллинг
        </h1>
        <Space>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={() => handleExport('csv')}
            style={{
              borderRadius: 12,
              height: 40,
              border: '1px solid #E3EED4',
              color: '#689071',
            }}
          >
            Экспорт
          </Button>
          <Button
            type="default"
            style={{
              borderRadius: 12,
              height: 40,
              border: '1px solid #E3EED4',
              color: '#689071',
            }}
          >
            📋 Посмотреть тарифы
          </Button>
        </Space>
      </div>

      <Card
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
          border: '2px solid #AEC380',
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(104, 144, 113, 0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0F2A1D', marginBottom: 12 }}>
              🏆 {billingInfo?.plan || 'Базовый план'}
            </div>
            <Tag 
              color={billingInfo?.status === 'active' ? '#689071' : 'default'}
              style={{ fontSize: 14, padding: '6px 16px', borderRadius: 12 }}
            >
              {billingInfo?.status === 'active' ? '✓ Активен' : 'Неактивен'}
            </Tag>
            {billingInfo?.next_payment_date && (
              <div style={{ marginTop: 8, color: '#689071', fontSize: 14 }}>
                Следующий платеж: {dayjs(billingInfo.next_payment_date).format('DD.MM.YYYY')}
              </div>
            )}
          </div>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => setIsInvoiceModalOpen(true)}
            loading={createInvoiceMutation.isPending}
            style={{
              background: 'linear-gradient(135deg, #689071 0%, #AEC380 100%)',
              border: 'none',
              borderRadius: 12,
              height: 40,
              fontWeight: 600,
            }}
          >
            📄 Выставить счет
          </Button>
        </div>
      </Card>

      <Card
        title={<span style={{ color: '#0F2A1D', fontSize: 16, fontWeight: 700 }}>📊 История оплат</span>}
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
          border: '1px solid #E3EED4',
          boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
        }}
      >
        <Table
          columns={columns}
          dataSource={paymentHistoryData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Всего: ${total}`,
          }}
          rowClassName={() => 'partner-table-row'}
          locale={{ emptyText: 'Нет данных о платежах' }}
        />
      </Card>

      <Modal
        title="Выставить счет"
        open={isInvoiceModalOpen}
        onCancel={() => {
          setIsInvoiceModalOpen(false);
          invoiceForm.resetFields();
        }}
        footer={null}
        style={{ borderRadius: 16 }}
      >
        <Form
          form={invoiceForm}
          layout="vertical"
          onFinish={handleCreateInvoice}
        >
          <Form.Item
            label="Сумма (сом)"
            name="amount"
            rules={[{ required: true, message: 'Введите сумму' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Введите сумму"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              parser={(value) => value!.replace(/\s?/g, '')}
            />
          </Form.Item>
          <Form.Item
            label="Срок оплаты"
            name="due_date"
            rules={[{ required: true, message: 'Выберите срок оплаты' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD.MM.YYYY"
              placeholder="Выберите дату"
            />
          </Form.Item>
          <Form.Item
            label="Описание"
            name="description"
          >
            <Input.TextArea
              rows={4}
              placeholder="Описание счета (необязательно)"
            />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsInvoiceModalOpen(false);
                invoiceForm.resetFields();
              }}>
                Отмена
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createInvoiceMutation.isPending}
                style={{
                  background: 'linear-gradient(135deg, #689071 0%, #AEC380 100%)',
                  border: 'none',
                }}
              >
                Создать счет
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .partner-table-row {
          transition: all 0.3s;
        }
        .partner-table-row:hover {
          background-color: #F0F7EB !important;
        }
      `}</style>
    </div>
  );
};

