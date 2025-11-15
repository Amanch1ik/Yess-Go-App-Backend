import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Form, Input, Button, Upload, Avatar, Space, Row, Col, message, Spin } from 'antd';
import { UserOutlined, UploadOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import partnerApi from '@/services/partnerApi';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { queryKeys } from '@/config/queryClient';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

dayjs.extend(relativeTime);
dayjs.locale('ru');

export const ProfilePage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  // Получаем данные профиля
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: queryKeys.partnerProfile,
    queryFn: async () => {
      const response = await partnerApi.getCurrentPartner();
      return response.data;
    },
    retry: 1,
  });

  // Обновляем форму при загрузке данных
  useEffect(() => {
    if (profileData) {
      form.setFieldsValue({
        email: profileData.email,
        phone: profileData.phone,
        first_name: profileData.first_name || profileData.username,
        last_name: profileData.last_name,
        company_name: profileData.partner_name || profileData.name,
        description: profileData.description,
      });
      if (profileData.avatar_url) {
        setAvatarUrl(profileData.avatar_url);
      }
    }
  }, [profileData, form]);

  // Мутация для обновления профиля
  const updateProfileMutation = useMutation({
    mutationFn: async (values: any) => {
      return await partnerApi.updateProfile(values);
    },
    onSuccess: () => {
      message.success(t('profile.updated', 'Профиль успешно обновлен'));
      queryClient.invalidateQueries({ queryKey: queryKeys.partnerProfile });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || t('common.error', 'Ошибка при обновлении профиля'));
    },
  });

  // Мутация для загрузки аватара
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      return await partnerApi.uploadAvatar(file);
    },
    onSuccess: (response) => {
      message.success(t('profile.avatarUploaded', 'Аватар успешно загружен'));
      if (response.data?.avatar_url) {
        setAvatarUrl(response.data.avatar_url);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.partnerProfile });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || t('profile.avatarUploadError', 'Ошибка при загрузке аватара'));
      setUploading(false);
    },
  });

  const handleSubmit = async (values: any) => {
    try {
      await updateProfileMutation.mutateAsync({
        email: values.email,
        phone: values.phone,
        first_name: values.first_name,
        last_name: values.last_name,
        company_name: values.company_name,
        description: values.description,
      });
    } catch (error) {
      // Ошибка уже обработана в onError
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (profileData) {
      form.setFieldsValue({
        email: profileData.email,
        phone: profileData.phone,
        first_name: profileData.first_name || profileData.username,
        last_name: profileData.last_name,
        company_name: profileData.partner_name || profileData.name,
        description: profileData.description,
      });
    }
  };

  const handleAvatarUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const response = await uploadAvatarMutation.mutateAsync(file as File);
      onSuccess?.(response);
      setUploading(false);
    } catch (error) {
      onError?.(error as Error);
      setUploading(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error(t('profile.imageOnly', 'Можно загружать только изображения!'));
      return false;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error(t('profile.imageSizeLimit', 'Изображение должно быть меньше 10MB!'));
      return false;
    }
    return true;
  };

  if (isLoadingProfile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const lastUpdated = profileData?.updated_at 
    ? dayjs(profileData.updated_at).fromNow()
    : t('common.recently', 'недавно');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 style={{
        background: 'linear-gradient(135deg, #217A44 0%, #37946e 60%, #bee3b6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        {t('profile.title', '👤 Профиль партнера')}
      </h1>
      <p style={{ color: '#37946e', margin: '8px 0 0 0', fontSize: 15, fontWeight: 500 }}>
        {t('profile.subtitle', 'Управляйте информацией вашего профиля и компании')}
      </p>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card
              style={{
                borderRadius: 16,
                background: 'linear-gradient(135deg, #ffffff 0%, #e3eed4 100%)',
                border: '1px solid #bee3b6',
                boxShadow: '0 2px 12px rgba(55,148,110,0.08)',
                textAlign: 'center',
              }}
            >
              <Avatar
                size={120}
                src={avatarUrl}
                icon={!avatarUrl && <UserOutlined />}
                style={{
                  backgroundColor: avatarUrl ? 'transparent' : '#37946e',
                  marginBottom: 16,
                }}
              />
              <h2 style={{ color: '#8B4513', marginTop: 0 }}>
                {profileData?.name || profileData?.username || t('profile.yourProfile', 'Ваш профиль')}
              </h2>
              <p style={{ color: '#37946e', marginBottom: 16 }}>
                {t('profile.updated', 'Обновлено')}: {lastUpdated}
              </p>
              <Upload
                customRequest={handleAvatarUpload}
                beforeUpload={beforeUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  loading={uploading}
                  style={{
                    background: 'linear-gradient(135deg, #37946e 0%, #4ca97d 50%, #bee3b6 100%)',
                    border: 'none',
                    borderRadius: 12,
                  }}
                >
                  {uploading ? t('common.loading', 'Загрузка...') : t('profile.uploadPhoto', 'Загрузить фото')}
                </Button>
              </Upload>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={16}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              title={<span style={{ color: '#8B4513', fontSize: 16, fontWeight: 700 }}>ℹ️ {t('profile.basicInfo', 'Основная информация')}</span>}
              style={{
                borderRadius: 16,
                background: 'linear-gradient(135deg, #ffffff 0%, #e3eed4 100%)',
                border: '1px solid #bee3b6',
                boxShadow: '0 2px 12px rgba(55,148,110,0.08)',
              }}
            >
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item 
                  label={t('profile.company', 'Название компании')} 
                  name="company_name"
                  rules={[{ required: true, message: t('profile.companyRequired', 'Введите название компании') }]}
                >
                  <Input 
                    size="large" 
                    placeholder={t('profile.company', 'Название компании')}
                    style={{ borderRadius: 12 }}
                  />
                </Form.Item>
                <Form.Item 
                  label={t('profile.firstName', 'Имя')} 
                  name="first_name"
                  rules={[{ required: true, message: t('profile.firstNameRequired', 'Введите имя') }]}
                >
                  <Input 
                    size="large" 
                    placeholder={t('profile.firstName', 'Имя')}
                    style={{ borderRadius: 12 }}
                  />
                </Form.Item>
                <Form.Item 
                  label={t('profile.lastName', 'Фамилия')} 
                  name="last_name"
                >
                  <Input 
                    size="large" 
                    placeholder={t('profile.lastName', 'Фамилия')}
                    style={{ borderRadius: 12 }}
                  />
                </Form.Item>
                <Form.Item 
                  label={t('profile.email', 'Email')} 
                  name="email"
                  rules={[
                    { required: true, message: t('profile.emailRequired', 'Введите email') },
                    { type: 'email', message: t('profile.emailInvalid', 'Введите корректный email') }
                  ]}
                >
                  <Input 
                    size="large" 
                    type="email"
                    prefix={<MailOutlined style={{ color: '#37946e' }} />}
                    placeholder="your@email.com"
                    style={{ borderRadius: 12 }}
                  />
                </Form.Item>
                <Form.Item 
                  label={t('profile.phone', 'Телефон')} 
                  name="phone"
                  rules={[{ required: true, message: t('profile.phoneRequired', 'Введите телефон') }]}
                >
                  <Input 
                    size="large" 
                    prefix={<PhoneOutlined style={{ color: '#37946e' }} />}
                    placeholder="+996 ..." 
                    style={{ borderRadius: 12 }}
                  />
                </Form.Item>
                <Form.Item label={t('profile.description', 'Описание')} name="description">
                  <Input.TextArea
                    placeholder={t('profile.descriptionPlaceholder', 'Расскажите о вашей компании')}
                    rows={4}
                    style={{ borderRadius: 12 }}
                  />
                </Form.Item>
                <Form.Item>
                  <Space size="middle" style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button
                      size="large"
                      onClick={handleCancel}
                      style={{
                        borderRadius: 12,
                        border: '1px solid #bee3b6',
                      }}
                    >
                      {t('common.cancel', 'Отмена')}
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={updateProfileMutation.isPending}
                      style={{
                        background: 'linear-gradient(135deg, #37946e 0%, #4ca97d 50%, #bee3b6 100%)',
                        border: 'none',
                        borderRadius: 12,
                      }}
                    >
                      💾 {t('profile.save', 'Сохранить изменения')}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
};

