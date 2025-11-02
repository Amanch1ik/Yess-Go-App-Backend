import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Form, Input, Select, Modal, message, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { notificationsApi } from '@/services/api';
import dayjs from 'dayjs';

const { TextArea } = Input;

export const NotificationsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll({ limit: 50 }).then(res => res.data),
  });

  const sendMutation = useMutation({
    mutationFn: (values: any) => notificationsApi.sendBulk(values),
    onSuccess: () => {
      message.success('Уведомление отправлено');
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleSend = () => {
    form.validateFields().then((values) => {
      sendMutation.mutate(values);
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Заголовок',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Сообщение',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Тип',
      dataIndex: 'notification_type',
      key: 'notification_type',
      render: (type: string) => {
        const colors: Record<string, string> = {
          push: 'blue',
          sms: 'green',
          email: 'orange',
          in_app: 'purple',
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors: Record<string, string> = {
          low: 'default',
          normal: 'blue',
          high: 'orange',
          urgent: 'red',
        };
        return <Tag color={colors[priority]}>{priority}</Tag>;
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          pending: 'default',
          sent: 'processing',
          delivered: 'success',
          failed: 'error',
          read: 'cyan',
        };
        const labels: Record<string, string> = {
          pending: 'Ожидает',
          sent: 'Отправлено',
          delivered: 'Доставлено',
          failed: 'Ошибка',
          read: 'Прочитано',
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
  ];

  return (
    <>
      <Card
        title="Уведомления"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Отправить уведомление
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data?.notifications || []}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title="Отправить уведомление"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSend}
        okText="Отправить"
        cancelText="Отмена"
        width={600}
        confirmLoading={sendMutation.isPending}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="title"
            label="Заголовок"
            rules={[{ required: true, message: 'Введите заголовок' }]}
          >
            <Input placeholder="Введите заголовок" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Сообщение"
            rules={[{ required: true, message: 'Введите сообщение' }]}
          >
            <TextArea rows={4} placeholder="Введите текст сообщения" />
          </Form.Item>

          <Form.Item
            name="notification_type"
            label="Тип уведомления"
            rules={[{ required: true, message: 'Выберите тип' }]}
          >
            <Select
              options={[
                { label: 'Push-уведомление', value: 'push' },
                { label: 'SMS', value: 'sms' },
                { label: 'Email', value: 'email' },
                { label: 'В приложении', value: 'in_app' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Приоритет"
            initialValue="normal"
          >
            <Select
              options={[
                { label: 'Низкий', value: 'low' },
                { label: 'Обычный', value: 'normal' },
                { label: 'Высокий', value: 'high' },
                { label: 'Срочный', value: 'urgent' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="target"
            label="Целевая аудитория"
            initialValue="all"
          >
            <Select
              options={[
                { label: 'Все пользователи', value: 'all' },
                { label: 'Активные пользователи', value: 'active' },
                { label: 'Новые пользователи', value: 'new' },
                { label: 'Неактивные пользователи', value: 'inactive' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
