'use client';

import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Alert,
  Row,
  Col,
  Typography,
  Select,
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';
import { MOCK_USERS } from '@/mock-data';

const { Title, Paragraph, Text } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuthStore();

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      await login(values.email, values.password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const user = MOCK_USERS[role];
    form.setFieldsValue({
      email: user.email,
      password: user.password,
    });
  };

  return (
    <MainLayout>
      <Row gutter={[24, 24]} justify="center" style={{ minHeight: 'calc(100vh - 300px)' }}>
        <Col xs={24} sm={20} md={12} lg={8}>
          <Card title={<Title level={3}>Login to Plant Decor</Title>} variant="borderless">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              autoComplete="off"
            >
              {error && <Alert message={error} type="error" style={{ marginBottom: '16px' }} />}

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Invalid email format' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="example@email.com"
                  type="email"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  Login
                </Button>
              </Form.Item>

              <Paragraph style={{ textAlign: 'center' }}>
                Don't have an account?{' '}
                <Link href="/auth/register">
                  <Button type="link" style={{ padding: 0 }}>
                    Sign up here
                  </Button>
                </Link>
              </Paragraph>
            </Form>

            {/* Quick Login for Testing */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
              <Paragraph style={{ color: '#999', fontSize: '12px', marginBottom: '12px' }}>
                🧪 <strong>Demo Accounts</strong> - Click to quick login:
              </Paragraph>
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.values(UserRole).map((role) => {
                  const user = MOCK_USERS[role as UserRole];
                  return (
                    <Button
                      key={role}
                      block
                      onClick={() => handleQuickLogin(role as UserRole)}
                      style={{ fontSize: '12px' }}
                    >
                      {role.toUpperCase()} - {user.name}
                    </Button>
                  );
                })}
              </Space>
            </div>
          </Card>
        </Col>

        {/* Info Card */}
        <Col xs={24} sm={20} md={12} lg={8}>
          <Card title={<Title level={4}>About Plant Decor</Title>}>
            <Space direction="vertical">
              <div>
                <Paragraph>
                  <strong>🌿 Welcome!</strong>
                </Paragraph>
                <Paragraph>
                  Plant Decor is your one-stop platform for beautiful plants and professional care services.
                </Paragraph>
              </div>

              <div>
                <Paragraph>
                  <strong>✨ Features:</strong>
                </Paragraph>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Browse our plant catalog</li>
                  <li>Shop and track orders</li>
                  <li>Register care services</li>
                  <li>Real-time order tracking</li>
                  <li>Chat with support</li>
                </ul>
              </div>

              <div>
                <Paragraph>
                  <strong>👤 User Roles:</strong>
                </Paragraph>
                <ul style={{ paddingLeft: '20px', fontSize: '12px' }}>
                  <li><Text code>Guest</Text> - Browse catalog</li>
                  <li><Text code>Customer</Text> - Full shopping + care services</li>
                  <li><Text code>Admin</Text> - System management</li>
                  <li><Text code>Support Staff</Text> - Care request management</li>
                  <li><Text code>Shipper</Text> - Delivery management</li>
                  <li><Text code>Caretaker</Text> - Plant care tasks</li>
                </ul>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
}
