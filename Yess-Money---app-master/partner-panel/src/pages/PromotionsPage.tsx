<<<<<<< HEAD
import { useState } from 'react';
import { Card, Table, Button, Tag, Avatar, Space, Modal, Form, Input, InputNumber, DatePicker, message, Spin, Dropdown } from 'antd';
import { PlusOutlined, ShopOutlined, EditOutlined, ExportOutlined } from '@ant-design/icons';
import { DeleteButton } from '../components/DeleteButton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionsApi } from '../services/api';
import { exportToCSV, exportToExcel, exportToJSON } from '../utils/exportUtils';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { queryKeys } from '@/config/queryClient';
import dayjs from 'dayjs';
=======
import { Card, Table, Button, Tag, Avatar, Space } from 'antd';
import { PlusOutlined, ShopOutlined, EditOutlined } from '@ant-design/icons';
import { DeleteButton } from '../components/DeleteButton';
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932

const promotionsData = [
  {
    key: '1',
    id: 1,
    title: 'Скидка 20%',
    discount: 20,
    period: '01.11 - 30.11 2025 год',
    partner: 'Глобус',
    priority: 190000,
    ctr: 6.75,
    stats: 6.9,
  },
];

<<<<<<< HEAD
const { RangePicker } = DatePicker;

export const PromotionsPage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const queryClient = useQueryClient();

  // Загрузка акций из API
  const { data: promotionsResponse, isLoading } = useQuery({
    queryKey: queryKeys.promotions,
    queryFn: async () => {
      try {
        const response = await promotionsApi.getPromotions();
        return response.data;
      } catch (err: any) {
        console.warn('Promotions API недоступен, используем моковые данные:', err);
        return promotionsData;
      }
    },
    retry: 1,
  });

  // Мутация для создания/обновления акции
  const createOrUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingPromotion?.id) {
        return await promotionsApi.updatePromotion(editingPromotion.id, data);
      } else {
        return await promotionsApi.createPromotion(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.promotions });
      message.success(editingPromotion?.id ? t('promotions.updated', 'Акция обновлена') : t('promotions.created', 'Акция создана'));
      form.resetFields();
      setIsModalOpen(false);
      setEditingPromotion(null);
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.detail || t('promotions.saveError', 'Ошибка при сохранении акции'));
    },
  });

  // Мутация для удаления акции
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await promotionsApi.deletePromotion(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.promotions });
      message.success(t('promotions.deleted', 'Акция удалена'));
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.detail || t('promotions.deleteError', 'Ошибка при удалении акции'));
    },
  });

  // Используем данные из API или моковые
  const allPromotions = promotionsResponse || promotionsData;

  const handleCreate = () => {
    setEditingPromotion(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingPromotion(record);
    form.setFieldsValue({
      ...record,
      period: record.period ? dayjs(record.period.split(' - ')[0], 'DD.MM.YYYY') : null,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      createOrUpdateMutation.mutate(values);
    } catch (err) {
      console.error('Validation failed:', err);
    }
  };

  const columns = [
    {
      title: t('promotions.titleField', 'Название'),
=======
export const PromotionsPage = () => {
  const columns = [
    {
      title: 'Название',
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
      key: 'title',
      render: (_: any, record: any) => (
        <Space>
          <div
            style={{
              width: 40,
              height: 40,
<<<<<<< HEAD
              background: 'linear-gradient(135deg, #217A44 0%, #37946e 50%, #bee3b6 100%)',
=======
              background: '#ff4d4f',
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          >
            <span>-{record.discount}%</span>
<<<<<<< HEAD
            <span style={{ fontSize: 10 }}>{t('promotions.discount', 'скидка')}</span>
          </div>
          <div>
            <div style={{ fontWeight: 500, color: '#37946e' }}>{record.title}</div>
            <div style={{ fontSize: 12, color: '#217A44' }}>
              -{record.discount}% {t('promotions.discount', 'скидка')}
=======
            <span style={{ fontSize: 10 }}>скидка</span>
          </div>
          <div>
            <div style={{ fontWeight: 500, color: '#0F2A1D' }}>{record.title}</div>
            <div style={{ fontSize: 12, color: '#689071' }}>
              -{record.discount}% скидка
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
            </div>
          </div>
        </Space>
      ),
    },
    {
<<<<<<< HEAD
      title: t('promotions.period', 'Период'),
=======
      title: 'Период',
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
      dataIndex: 'period',
      key: 'period',
    },
    {
<<<<<<< HEAD
      title: t('nav.partner', 'Партнер'),
      key: 'partner',
      render: (_: any, record: any) => (
        <Space>
          <Avatar icon={<ShopOutlined />} size="small" style={{ backgroundColor: '#217A44' }}>
=======
      title: 'Партнер',
      key: 'partner',
      render: (_: any, record: any) => (
        <Space>
          <Avatar icon={<ShopOutlined />} size="small" style={{ backgroundColor: '#689071' }}>
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
            G
          </Avatar>
          <span>{record.partner}</span>
        </Space>
      ),
    },
    {
<<<<<<< HEAD
      title: t('promotions.priority', 'Приоритет'),
=======
      title: 'Приоритет',
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
      dataIndex: 'priority',
      key: 'priority',
    },
    {
      title: 'CTR',
      dataIndex: 'ctr',
      key: 'ctr',
      render: (ctr: number) => `${ctr}%`,
    },
    {
<<<<<<< HEAD
      title: t('promotions.stats', 'Статистика'),
=======
      title: 'Статистика',
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
      dataIndex: 'stats',
      key: 'stats',
      render: (stats: number) => `${stats}%`,
    },
    {
<<<<<<< HEAD
      title: t('common.actions', 'Действие'),
=======
      title: 'Действие',
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
<<<<<<< HEAD
            onClick={() => handleEdit(record)}
            style={{ color: '#217A44' }}
          />
          <DeleteButton
            onDelete={() => deleteMutation.mutate(record.id)}
            text=""
            className="danger compact icon-only"
            confirmTitle={t('promotions.deleteConfirm', 'Удалить акцию?')}
            confirmContent={t('common.deleteWarning', 'Вы уверены, что хотите удалить эту акцию?')}
            confirmOkText={t('common.delete', 'Удалить')}
            confirmCancelText={t('common.cancel', 'Отменить')}
=======
            onClick={() => console.log('Edit promotion', record.id)}
          />
          <DeleteButton
            onDelete={() => console.log('Delete promotion', record.id)}
            text=""
            className="danger compact icon-only"
            confirmTitle="Удалить акцию?"
            confirmContent="Вы уверены, что хотите удалить эту акцию?"
            confirmOkText="Удалить"
            confirmCancelText="Отменить"
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
          />
        </Space>
      ),
    },
  ];

<<<<<<< HEAD
  // Экспорт данных
  const handleExport = (format: 'csv' | 'excel' | 'json' = 'csv') => {
    if (!allPromotions || allPromotions.length === 0) {
      message.warning(t('common.noDataToExport', 'Нет данных для экспорта'));
      return;
    }

    const exportColumns = [
      { key: 'id', title: 'ID' },
      { key: 'title', title: t('promotions.titleField', 'Название') },
      { key: 'discount', title: t('promotions.discount', 'Скидка (%)'), render: (val: number) => `${val}%` },
      { key: 'period', title: t('promotions.period', 'Период') },
      { key: 'partner', title: t('nav.partner', 'Партнер') },
    ];

    try {
      if (format === 'csv') {
        exportToCSV(allPromotions, exportColumns, 'promotions');
        message.success(t('common.exportSuccess', 'Файл успешно загружен'));
      } else if (format === 'excel') {
        exportToExcel(allPromotions, exportColumns, 'promotions');
        message.success(t('common.exportSuccess', 'Файл успешно загружен'));
      } else {
        exportToJSON(allPromotions, 'promotions');
        message.success(t('common.exportSuccess', 'Файл успешно загружен'));
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error(t('common.exportError', 'Ошибка при экспорте данных'));
    }
  };

  const exportMenuItems = [
    { key: 'csv', label: t('common.exportCSV', 'Экспорт в CSV'), onClick: () => handleExport('csv') },
    { key: 'excel', label: t('common.exportExcel', 'Экспорт в Excel'), onClick: () => handleExport('excel') },
    { key: 'json', label: t('common.exportJSON', 'Экспорт в JSON'), onClick: () => handleExport('json') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ background: 'linear-gradient(135deg, #217A44 0%, #37946e 60%, #bee3b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t('nav.promotions', '🎁 Акции и сторисы')}</h1>
        <p style={{ color: '#37946e', fontWeight: 500 }}>{t('promotions.subtitle', 'Управляйте акциями и сторисами для ваших клиентов')}</p>
        <Space>
          <Dropdown
            menu={{ items: exportMenuItems }}
            trigger={['click']}
          >
            <Button
              type="default"
              icon={<ExportOutlined />}
              style={{
                borderRadius: 12,
                borderColor: '#217A44',
                color: '#217A44',
                height: 40,
                fontWeight: 600,
              }}
            >
              {t('common.export', 'Экспорт')}
            </Button>
          </Dropdown>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            style={{
              background: 'linear-gradient(135deg, #217A44 0%, #37946e 50%, #bee3b6 100%)',
              border: 'none',
              borderRadius: 12,
              height: 40,
              fontWeight: 600,
            }}
          >
            + {t('promotions.add', 'Создать акцию')}
          </Button>
        </Space>
      </div>

      <Card style={{ background: 'linear-gradient(135deg, #ffffff 0%, #e3eed4 100%)', borderRadius: 16, border: '1px solid #bee3b6' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={allPromotions}
            pagination={{ pageSize: 10 }}
            rowClassName={() => 'partner-table-row'}
            loading={isLoading}
          />
        )}
      </Card>

      {/* Модальное окно для создания/редактирования акции */}
      <Modal
        title={editingPromotion ? t('promotions.edit', 'Редактировать акцию') : t('promotions.add', 'Создать акцию')}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingPromotion(null);
        }}
        onOk={handleSave}
        okText={t('common.save', 'Сохранить')}
        cancelText={t('common.cancel', 'Отмена')}
        confirmLoading={createOrUpdateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="title"
            label={t('promotions.titleField', 'Название акции')}
            rules={[{ required: true, message: t('promotions.titleRequired', 'Введите название акции') }]}
          >
            <Input placeholder={t('promotions.titlePlaceholder', 'Например: Скидка 20%')} />
          </Form.Item>
          <Form.Item
            name="discount"
            label={t('promotions.discount', 'Размер скидки (%)')}
            rules={[{ required: true, message: t('promotions.discountRequired', 'Введите размер скидки') }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="20" />
          </Form.Item>
          <Form.Item
            name="period"
            label={t('promotions.period', 'Период действия')}
            rules={[{ required: true, message: t('promotions.periodRequired', 'Выберите период действия') }]}
          >
            <RangePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
        </Form>
      </Modal>
=======
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#8B4513' }}>
          🎁 Акции и сторисы
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
          + Создать акцию
        </Button>
      </div>

      <Card
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #ffffff 0%, #FFF4E6 100%)',
          border: '1px solid #FFE6CC',
          boxShadow: '0 2px 12px rgba(245, 166, 35, 0.08)',
        }}
      >
        <Table
          columns={columns}
          dataSource={promotionsData}
          pagination={{ pageSize: 10 }}
          rowClassName={() => 'partner-table-row'}
        />
      </Card>
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932

      <style>{`
        .partner-table-row {
          transition: all 0.3s;
        }
        .partner-table-row:hover {
          background-color: #FFF4E6 !important;
        }
      `}</style>
<<<<<<< HEAD
    </motion.div>
=======
    </div>
>>>>>>> 4acdea9993d0ca7e5e7d144ac0920409bca2b932
  );
};

