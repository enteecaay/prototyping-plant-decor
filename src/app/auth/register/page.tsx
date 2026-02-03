'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Row, Col, Typography, Checkbox } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';

const { Title, Paragraph } = Typography;

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (values: any) => {
    setLoading(true);
    setError(null);

    try {
      // Mock registration - in production, this would call backend API
      console.log('Registration data:', values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <Row gutter={[24, 24]} justify="center" style={{ minHeight: 'calc(100vh - 300px)' }}>
          <Col xs={24} sm={20} md={12} lg={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Title level={3}>✅ Registration Successful!</Title>
                <Paragraph>
                  Your account has been created. Redirecting to login page...
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} sm={20} md={12} lg={10}>
          <Card title={<Title level={3}>Create Your Account</Title>} variant="borderless">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleRegister}
              autoComplete="off"
            >
              {error && (
                <Alert
                  message={error}
                  type="error"
                  style={{ marginBottom: '16px' }}
                  closable
                  onClose={() => setError(null)}
                />
              )}

              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Your full name" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Invalid email format' },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="example@email.com" type="email" />
              </Form.Item>

              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  { required: true, message: 'Please enter your phone number' },
                  { pattern: /^[0-9]{10,}$/, message: 'Invalid phone number' },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" />
              </Form.Item>

              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: 'Please enter your address' }]}
              >
                <Input.TextArea
                  placeholder="Your address"
                  rows={3}
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please enter your password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password placeholder="Min 6 characters" />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm password" />
              </Form.Item>

              <Form.Item
                name="agree"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(new Error('You must agree to the terms')),
                  },
                ]}
              >
                <Checkbox>
                  I agree to the Terms and Conditions
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  Create Account
                </Button>
              </Form.Item>

              <Paragraph style={{ textAlign: 'center' }}>
                Already have an account?{' '}
                <Link href="/auth/login">
                  <Button type="link" style={{ padding: 0 }}>
                    Login here
                  </Button>
                </Link>
              </Paragraph>
            </Form>
          </Card>
        </Col>

        <Col xs={24} sm={20} md={12} lg={10}>
          <Card title={<Title level={4}>Why Join Plant Decor?</Title>}>
            <ul style={{ paddingLeft: '20px' }}>
              <li>🌱 Access to premium plant collection</li>
              <li>🧑‍🌾 Professional plant care services</li>
              <li>📦 Fast and reliable shipping</li>
              <li>💬 24/7 customer support</li>
              <li>📱 Real-time order tracking</li>
              <li>🎁 Exclusive member benefits</li>
              <li>📊 Track your plant care progress</li>
              <li>🌍 Join our plant lover community</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
}
