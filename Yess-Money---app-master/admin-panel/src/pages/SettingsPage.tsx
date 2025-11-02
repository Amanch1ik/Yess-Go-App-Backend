import { Card, Tabs, Form, Input, InputNumber, Switch, Button, message, Divider } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useState } from 'react';

export const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [generalForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [notificationForm] = Form.useForm();

  const handleSave = async (_values: any, formName: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(`Настройки ${formName} сохранены`);
    } catch (error) {
      message.error('Ошибка сохранения настроек');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'general',
      label: 'Общие',
      children: (
        <Form
          form={generalForm}
          layout="vertical"
          onFinish={(values) => handleSave(values, 'общие')}
          initialValues={{
            app_name: 'YESS Loyalty',
            support_email: 'support@yess-loyalty.com',
            support_phone: '+996 551 69 72 96',
            maintenance_mode: false,
          }}
        >
          <Form.Item
            name="app_name"
            label="Название приложения"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="support_email"
            label="Email поддержки"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="support_phone"
            label="Телефон поддержки"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="maintenance_mode"
            label="Режим обслуживания"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Сохранить
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'payment',
      label: 'Платежи',
      children: (
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={(values) => handleSave(values, 'платежей')}
          initialValues={{
            min_topup_amount: 100,
            max_topup_amount: 100000,
            commission_rate: 2.5,
            cashback_rate: 5,
            bonus_multiplier: 2,
          }}
        >
          <Divider>Лимиты пополнения</Divider>

          <Form.Item
            name="min_topup_amount"
            label="Минимальная сумма пополнения (сом)"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="max_topup_amount"
            label="Максимальная сумма пополнения (сом)"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Divider>Комиссии и бонусы</Divider>

          <Form.Item
            name="commission_rate"
            label="Комиссия (%)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="cashback_rate"
            label="Базовая ставка кэшбэка (%)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={100} step={0.5} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="bonus_multiplier"
            label="Множитель бонусов при пополнении"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={10} step={0.5} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Сохранить
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'notifications',
      label: 'Уведомления',
      children: (
        <Form
          form={notificationForm}
          layout="vertical"
          onFinish={(values) => handleSave(values, 'уведомлений')}
          initialValues={{
            push_enabled: true,
            sms_enabled: true,
            email_enabled: true,
            marketing_enabled: true,
            transaction_notifications: true,
            promotion_notifications: true,
          }}
        >
          <Divider>Каналы уведомлений</Divider>

          <Form.Item
            name="push_enabled"
            label="Push-уведомления"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="sms_enabled"
            label="SMS-уведомления"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="email_enabled"
            label="Email-уведомления"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider>Типы уведомлений</Divider>

          <Form.Item
            name="marketing_enabled"
            label="Маркетинговые уведомления"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="transaction_notifications"
            label="Уведомления о транзакциях"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="promotion_notifications"
            label="Уведомления об акциях"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Сохранить
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <Card title="Настройки системы">
      <Tabs items={tabItems} />
    </Card>
  );
};
