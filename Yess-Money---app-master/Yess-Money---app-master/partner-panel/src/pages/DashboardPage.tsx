import { Card, Row, Col, Statistic, Button, Space } from 'antd';
import {
  PlusOutlined,
  UserAddOutlined,
  AreaChartOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const salesData = [
  { date: '29 май', value: 220342.76 },
  { date: '30 май', value: 180234.12 },
  { date: '31 май', value: 250123.45 },
  { date: '1 июн', value: 210456.78 },
  { date: '2 июн', value: 190234.56 },
];

export const DashboardPage = () => {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32 
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#223732' }}>
          📊 Главная
        </h1>
        <Space>
          <Button type="default" size="large">Экспорт</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #e3eed4 100%)',
              border: '2px solid #bee3b6',
              boxShadow: '0 4px 12px rgba(55, 148, 110, 0.15)',
              transition: 'all 0.3s',
            }}
          >
            <Statistic
              title={<span style={{ color: '#37946e', fontWeight: 600 }}>💰 Продажи</span>}
              value={10325}
              suffix=" ₽"
              valueStyle={{ color: '#223732', fontWeight: 700, fontSize: 32 }}
            />
            <div style={{ fontSize: 12, color: '#37946e', marginTop: 8 }}>↑ 12% vs прошлый месяц</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #e3eed4 100%)',
              border: '2px solid #bee3b6',
              boxShadow: '0 4px 12px rgba(55, 148, 110, 0.15)',
              transition: 'all 0.3s',
            }}
          >
            <Statistic
              title={<span style={{ color: '#37946e', fontWeight: 600 }}>📈 Средний чек</span>}
              value={750}
              suffix=" ₽"
              valueStyle={{ color: '#223732', fontWeight: 700, fontSize: 32 }}
            />
            <div style={{ fontSize: 12, color: '#37946e', marginTop: 8 }}>↑ 8% vs прошлый месяц</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #ffffff 0%, #e3eed4 100%)',
              border: '2px solid #bee3b6',
              boxShadow: '0 4px 12px rgba(55, 148, 110, 0.15)',
              transition: 'all 0.3s',
            }}
          >
            <Statistic
              title={<span style={{ color: '#37946e', fontWeight: 600 }}>⭐ Начислено Coin</span>}
              value={6.4}
              suffix=" млн"
              valueStyle={{ color: '#223732', fontWeight: 700, fontSize: 32 }}
            />
            <div style={{ fontSize: 12, color: '#37946e', marginTop: 8 }}>↑ 24% vs прошлый месяц</div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AreaChartOutlined style={{ color: '#37946e', fontSize: 20 }} />
              <span style={{ fontWeight: 700, color: '#223732', fontSize: 18 }}>Продажи по дням</span>
            </div>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#37946e' }}>128,7K ₽</span>
          </div>
        }
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #ffffff 0%, #e3eed4 100%)',
          border: '1px solid #bee3b6',
          marginBottom: 32,
          boxShadow: '0 2px 12px rgba(55, 148, 110, 0.08)',
        }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#37946e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#37946e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#bee3b6" />
            <XAxis dataKey="date" stroke="#223732" />
            <YAxis stroke="#223732" />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #bee3b6',
                background: '#ffffff',
                boxShadow: '0 4px 12px rgba(55, 148, 110, 0.2)',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#37946e" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
              dot={{ fill: '#37946e', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            style={{
              width: '100%',
              height: 60,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #37946e 0%, #69bb7b 100%)',
              border: 'none',
              fontSize: 16,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(55, 148, 110, 0.3)',
            }}
          >
            ➕ Создать акцию
          </Button>
        </Col>
        <Col xs={24} sm={12}>
          <Button
            type="primary"
            size="large"
            icon={<UserAddOutlined />}
            style={{
              width: '100%',
              height: 60,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #37946e 0%, #69bb7b 100%)',
              border: 'none',
              fontSize: 16,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(55, 148, 110, 0.3)',
            }}
          >
            👥 Добавить сотрудника
          </Button>
        </Col>
      </Row>
    </div>
  );
};

