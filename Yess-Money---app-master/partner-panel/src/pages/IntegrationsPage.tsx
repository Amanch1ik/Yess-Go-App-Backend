<<<<<<< HEAD
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Table, Button, Space, Switch, Modal, Form, Input, message, Spin } from 'antd';
import { CopyOutlined, PlusOutlined } from '@ant-design/icons';
import { DeleteButton } from '../components/DeleteButton';
import partnerApi from '@/services/partnerApi';
import dayjs from 'dayjs';

export const IntegrationsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Получаем API ключи
  const { data: apiKeys, isLoading: isLoadingKeys, refetch: refetchKeys } = useQuery({
    queryKey: ['partner-api-keys'],
    queryFn: async () => {
      try {
        const response = await partnerApi.getApiKeys();
        return response.data?.items || response.data || [];
      } catch (error: any) {
        // Fallback на mock данные если API недоступен
        if (error?.response?.status === 404 || error?.code === 'ERR_NETWORK') {
          return [
            {
              id: 1,
              name: 'POS integration',
              api_key: '1a2b3c4d5e6f',
              created_at: '2025-10-20T14:29:00',
            },
            {
              id: 2,
              name: 'Loyalty API',
              api_key: '6fg78h9i0j',
              created_at: '2025-10-20T14:29:00',
            },
            {
              id: 3,
              name: 'Webhook',
              api_key: '1k2i3m4k5o',
              created_at: '2025-10-20T14:29:00',
            },
          ];
        }
        throw error;
      }
    },
    retry: 1,
  });

  // Получаем настройки интеграций
  const { data: integrationSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['partner-integration-settings'],
    queryFn: async () => {
      try {
        const response = await partnerApi.getIntegrationSettings();
        return response.data;
      } catch (error: any) {
        // Fallback на mock данные если API недоступен
        if (error?.response?.status === 404 || error?.code === 'ERR_NETWORK') {
          return {
            notify_cashback: true,
          };
        }
        throw error;
      }
    },
    retry: 1,
  });

  // Мутация для создания API ключа
  const createApiKeyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await partnerApi.createApiKey(data);
    },
    onSuccess: () => {
      message.success('API ключ успешно создан');
      setIsCreateModalOpen(false);
      form.resetFields();
      refetchKeys();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Ошибка при создании API ключа');
    },
  });

  // Мутация для удаления API ключа
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      return await partnerApi.deleteApiKey(id);
    },
    onSuccess: () => {
      message.success('API ключ успешно удален');
      refetchKeys();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Ошибка при удалении API ключа');
    },
  });

  // Мутация для обновления настроек
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await partnerApi.updateIntegrationSettings(data);
    },
    onSuccess: () => {
      message.success('Настройки успешно обновлены');
      queryClient.invalidateQueries({ queryKey: ['partner-integration-settings'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Ошибка при обновлении настроек');
    },
  });

  const handleCreateApiKey = async (values: any) => {
    try {
      await createApiKeyMutation.mutateAsync({
        name: values.name,
        description: values.description,
      });
    } catch (error) {
      // Ошибка уже обработана в onError
    }
  };

  const handleDeleteApiKey = async (id: number) => {
    try {
      await deleteApiKeyMutation.mutateAsync(id);
    } catch (error) {
      // Ошибка уже обработана в onError
    }
  };

  const handleToggleNotification = (checked: boolean) => {
    updateSettingsMutation.mutate({
      notify_cashback: checked,
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    message.success('Ключ скопирован в буфер обмена');
  };
=======
import { Card, Table, Button, Space, Tag, Switch } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { DeleteButton } from '../components/DeleteButton';

const integrationsData = [
  {
    key: '1',
    id: 1,
    name: 'POS integration',
    key: '1a2b3c4d5e6f',
    date: '20.10.2025 14:29',
  },
  {
    key: '2',
    id: 2,
    name: 'Loyalty API',
    key: '6fg78h9i0j',
    date: '20.10.2025 14:29',
  },
  {
    key: '3',
    id: 3,
    name: 'Webhook',
    key: '1k2i3m4k5o',
    date: '20.10.2025 14:29',
  },
  {
    key: '4',
    id: 4,
    name: 'POS integration',
    key: '1a2b3c4d5e6f',
    date: '20.10.2025 14:29',
  },
  {
    key: '5',
    id: 5,
    name: 'Loyalty API',
    key: '6fg78h9i0j',
    date: '20.10.2025 14:29',
  },
  {
    key: '6',
    id: 6,
    name: 'Webhook',
    key: '1k2i3m4k5o',
    date: '20.10.2025 14:29',
  },
];

export const IntegrationsPage = () => {
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ключ',
<<<<<<< HEAD
      dataIndex: 'api_key',
      key: 'api_key',
      render: (key: string) => (
        <Space>
          <code style={{ background: '#F0F7EB', padding: '4px 8px', borderRadius: 4, color: '#0F2A1D' }}>
            {key || '-'}
          </code>
          {key && (
            <Button
              type="text"
              icon={<CopyOutlined />}
              size="small"
              onClick={() => handleCopyKey(key)}
              title="Скопировать ключ"
            />
          )}
=======
      dataIndex: 'key',
      key: 'key',
      render: (key: string) => (
        <Space>
          <code style={{ background: '#F0F7EB', padding: '4px 8px', borderRadius: 4 }}>{key}</code>
          <Button
            type="text"
            icon={<CopyOutlined />}
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(key);
            }}
          />
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
        </Space>
      ),
    },
    {
      title: 'Дата создания',
<<<<<<< HEAD
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-',
=======
      dataIndex: 'date',
      key: 'date',
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
    },
    {
      title: 'Действие',
      key: 'actions',
      render: (_: any, record: any) => (
        <DeleteButton
<<<<<<< HEAD
          onDelete={() => handleDeleteApiKey(record.id)}
          text=""
          className="danger compact icon-only"
          confirmTitle="Удалить API ключ?"
          confirmContent="Это действие нельзя отменить. После удаления ключ перестанет работать."
=======
          onDelete={() => console.log('Delete integration', record.id)}
          text=""
          className="danger compact icon-only"
          confirmTitle="Удалить API ключ?"
          confirmContent="Это действие нельзя отменить"
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
          confirmOkText="Удалить"
          confirmCancelText="Отменить"
        />
      ),
    },
  ];

<<<<<<< HEAD
  const integrationsData = (apiKeys || []).map((item: any) => ({
    ...item,
    key: item.id,
  }));

  if (isLoadingKeys || isLoadingSettings) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#0F2A1D', background: 'linear-gradient(135deg, #0F2A1D 0%, #689071 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
=======
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#8B4513' }}>
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
          🔌 Интеграции
        </h1>
        <Button
          type="primary"
<<<<<<< HEAD
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
          loading={createApiKeyMutation.isPending}
          style={{
            background: 'linear-gradient(135deg, #689071 0%, #AEC380 100%)',
=======
          style={{
            background: 'linear-gradient(135deg, #F5A623 0%, #F7B731 100%)',
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
            border: 'none',
            borderRadius: 12,
            height: 40,
            fontWeight: 600,
          }}
        >
          + Новый ключ API
        </Button>
      </div>

      <Card
<<<<<<< HEAD
        title={<span style={{ color: '#0F2A1D', fontSize: 16, fontWeight: 700 }}>🔑 API Ключи</span>}
=======
        title={<span style={{ color: '#8B4513', fontSize: 16, fontWeight: 700 }}>🔑 API Ключи</span>}
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #ffffff 0%, #FFF4E6 100%)',
          border: '1px solid #FFE6CC',
          marginBottom: 24,
          boxShadow: '0 2px 12px rgba(245, 166, 35, 0.08)',
        }}
      >
        <Table
          columns={columns}
          dataSource={integrationsData}
          pagination={{ pageSize: 10 }}
          rowClassName={() => 'partner-table-row'}
        />
      </Card>

      <Card
<<<<<<< HEAD
        title={<span style={{ color: '#0F2A1D', fontSize: 16, fontWeight: 700 }}>🔔 Уведомления</span>}
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #ffffff 0%, #F0F7EB 100%)',
          border: '1px solid #E3EED4',
          boxShadow: '0 2px 12px rgba(15, 42, 29, 0.08)',
        }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span style={{ color: '#0F2A1D', fontWeight: 500 }}>Уведомлять клиента о кешбэке</span>
          <Switch
            checked={integrationSettings?.notify_cashback ?? true}
            onChange={handleToggleNotification}
            loading={updateSettingsMutation.isPending}
            style={{ backgroundColor: integrationSettings?.notify_cashback ? '#689071' : undefined }}
          />
        </Space>
      </Card>

      <Modal
        title="Создать новый API ключ"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        style={{ borderRadius: 16 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateApiKey}
        >
          <Form.Item
            label="Название"
            name="name"
            rules={[{ required: true, message: 'Введите название ключа' }]}
          >
            <Input placeholder="Например: POS integration" />
          </Form.Item>
          <Form.Item
            label="Описание"
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Описание использования ключа (необязательно)"
            />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsCreateModalOpen(false);
                form.resetFields();
              }}>
                Отмена
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createApiKeyMutation.isPending}
                style={{
                  background: 'linear-gradient(135deg, #689071 0%, #AEC380 100%)',
                  border: 'none',
                }}
              >
                Создать ключ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

=======
        title={<span style={{ color: '#8B4513', fontSize: 16, fontWeight: 700 }}>🔔 Уведомления</span>}
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #ffffff 0%, #FFF4E6 100%)',
          border: '1px solid #FFE6CC',
          boxShadow: '0 2px 12px rgba(245, 166, 35, 0.08)',
        }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span style={{ color: '#8B4513', fontWeight: 500 }}>Уведомлять клиента о кешбэке</span>
          <Switch defaultChecked style={{ backgroundColor: '#F5A623' }} />
        </Space>
      </Card>

>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
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

