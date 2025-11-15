import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Table, Tag, Modal, Form, Input, Select, DatePicker, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { promotionsApi } from '@/services/api';
import { Promotion } from '@/types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export const PromotionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => promotionsApi.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (values: any) => promotionsApi.create(values),
    onSuccess: () => {
      message.success('Акция создана');
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => promotionsApi.update(id, data),
    onSuccess: () => {
      message.success('Акция обновлена');
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => promotionsApi.delete(id),
    onSuccess: () => {
      message.success('Акция удалена');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPromotion(null);
    form.resetFields();
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    form.setFieldsValue({
      ...promotion,
      dates: [dayjs(promotion.start_date), dayjs(promotion.end_date)],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Удалить акцию?',
      content: 'Вы уверены, что хотите удалить эту акцию?',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        start_date: values.dates[0].toISOString(),
        end_date: values.dates[1].toISOString(),
      };
      delete payload.dates;

      if (editingPromotion) {
        updateMutation.mutate({ id: editingPromotion.id, data: payload });
      } else {
        createMutation.mutate(payload);
      }
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
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag>{category}</Tag>,
    },
    {
      title: 'Тип',
      dataIndex: 'promotion_type',
      key: 'promotion_type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Скидка',
      key: 'discount',
      render: (_: any, record: Promotion) => {
        if (record.discount_percent) return `${record.discount_percent}%`;
        if (record.discount_amount) return `${record.discount_amount} сом`;
        return '-';
      },
    },
    {
      title: 'Период',
      key: 'period',
      render: (_: any, record: Promotion) => (
        <span>
          {dayjs(record.start_date).format('DD.MM.YY')} - {dayjs(record.end_date).format('DD.MM.YY')}
        </span>
      ),
    },
    {
      title: 'Использовано',
      dataIndex: 'usage_count',
      key: 'usage_count',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          draft: 'default',
          active: 'success',
          paused: 'warning',
          expired: 'error',
          cancelled: 'default',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Promotion) => (
        <>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          >
            Изменить
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Удалить
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Акции и промо-кампании"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Создать акцию
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title={editingPromotion ? 'Редактировать акцию' : 'Создать акцию'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        okText={editingPromotion ? 'Сохранить' : 'Создать'}
        cancelText="Отмена"
        width={700}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="title"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="category"
            label="Категория"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: 'Общая', value: 'general' },
                { label: 'Партнерская', value: 'partner' },
                { label: 'Сезонная', value: 'seasonal' },
                { label: 'Реферальная', value: 'referral' },
                { label: 'Лояльность', value: 'loyalty' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="promotion_type"
            label="Тип акции"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: 'Процентная скидка', value: 'discount_percent' },
                { label: 'Фиксированная скидка', value: 'discount_amount' },
                { label: 'Кэшбэк', value: 'cashback' },
                { label: 'Бонусные баллы', value: 'bonus_points' },
              ]}
            />
          </Form.Item>

          <Form.Item name="discount_percent" label="Процент скидки">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="discount_amount" label="Сумма скидки (сом)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="dates"
            label="Период действия"
            rules={[{ required: true, message: 'Выберите период' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="usage_limit" label="Лимит использований">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Статус"
            initialValue="draft"
          >
            <Select
              options={[
                { label: 'Черновик', value: 'draft' },
                { label: 'Активна', value: 'active' },
                { label: 'Приостановлена', value: 'paused' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
