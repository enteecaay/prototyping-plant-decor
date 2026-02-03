'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Avatar, message, Tabs } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, SaveOutlined } from '@ant-design/icons';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';

export default function CustomerProfilePage() {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async (values: any) => {
    setLoading(true);
    // Mock save - in production, call API
    setTimeout(() => {
      message.success('Profile updated successfully');
      setLoading(false);
    }, 1000);
  };

  const tabs = [
    {
      key: 'profile',
      label: '👤 Profile',
      children: (
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{
              name: user?.name || '',
              email: user?.email || '',
              phone: user?.phone || '',
              address: user?.address || '',
            }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Your name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Invalid email' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email" disabled />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Phone"
                  name="phone"
                  rules={[{ required: true, message: 'Please enter your phone' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Phone number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Address" name="address">
                  <Input.TextArea rows={2} placeholder="Your address" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'password',
      label: '🔒 Change Password',
      children: (
        <Card>
          <Form layout="vertical" onFinish={() => message.success('Password changed successfully')}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Current Password"
                  name="currentPassword"
                  rules={[{ required: true }]}
                >
                  <Input.Password placeholder="Current password" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}></Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="New Password"
                  name="newPassword"
                  rules={[{ required: true, min: 6 }]}
                >
                  <Input.Password placeholder="New password" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm new password" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRoles={[UserRole.CUSTOMER]}>
      <MainLayout title="My Profile">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card style={{ textAlign: 'center' }}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                src={user?.avatar}
                style={{ backgroundColor: '#87d068', marginBottom: '16px' }}
              />
              <h2>{user?.name}</h2>
              <p style={{ color: '#999' }}>{user?.email}</p>
              <p style={{ color: '#999' }}>{user?.role?.toUpperCase()}</p>
            </Card>
          </Col>
          <Col xs={24} md={16}>
            <Tabs items={tabs} />
          </Col>
        </Row>
      </MainLayout>
    </ProtectedRoute>
  );
}
