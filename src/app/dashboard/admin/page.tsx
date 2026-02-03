'use client';

import React from 'react';
import { Row, Col, Card, Statistic, Table, Tabs, Button, Tag, Space, Empty } from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  GiftOutlined,
  FileTextOutlined,
  BarChartOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';
import {
  MOCK_USERS,
  MOCK_PLANTS,
  MOCK_CARE_PACKAGES,
  MOCK_MATERIALS,
  MOCK_ORDERS,
  MOCK_CARE_SERVICE_REQUESTS,
} from '@/mock-data';

export default function AdminDashboard() {
  const { user } = useAuthStore();

  const userColumns: any[] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (role: string) => <Tag>{role.toUpperCase()}</Tag> },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Status', key: 'status', render: () => <Tag color="green">Active</Tag> },
  ];

  const plantColumns: any[] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: ['category', 'name'], key: 'category' },
    { title: 'Stock', dataIndex: 'stock', key: 'stock' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (price: number) => `₫${price.toLocaleString()}` },
    { title: 'Rating', dataIndex: 'rating', key: 'rating' },
  ];

  const orderColumns: any[] = [
    { title: 'Order ID', dataIndex: 'id', key: 'id' },
    { title: 'Customer', dataIndex: 'customerId', key: 'customerId' },
    { title: 'Total', dataIndex: 'totalPrice', key: 'totalPrice', render: (price: number) => `₫${price.toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <Tag>{status.toUpperCase()}</Tag> },
  ];

  const packageColumns: any[] = [
    { title: 'Package Name', dataIndex: 'name', key: 'name' },
    { title: 'Duration (days)', dataIndex: 'duration', key: 'duration' },
    { title: 'Frequency', dataIndex: 'frequency', key: 'frequency' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (price: number) => `₫${price.toLocaleString()}` },
  ];

  const tabs = [
    {
      key: 'overview',
      label: '📊 Overview',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Users" value={Object.keys(MOCK_USERS).length} prefix={<UserOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Plants" value={MOCK_PLANTS.length} prefix={<GiftOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Orders" value={MOCK_ORDERS.length} prefix={<ShoppingOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Active Services" value={MOCK_CARE_SERVICE_REQUESTS.length} prefix={<FileTextOutlined />} />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'users',
      label: `👥 Users (${Object.keys(MOCK_USERS).length})`,
      children: (
        <Card>
          <Table columns={userColumns} dataSource={Object.values(MOCK_USERS)} rowKey="id" pagination={{ pageSize: 10 }} />
        </Card>
      ),
    },
    {
      key: 'plants',
      label: `🌿 Plants (${MOCK_PLANTS.length})`,
      children: (
        <Card>
          <Table columns={plantColumns} dataSource={MOCK_PLANTS} rowKey="id" pagination={{ pageSize: 10 }} />
        </Card>
      ),
    },
    {
      key: 'orders',
      label: `📦 Orders (${MOCK_ORDERS.length})`,
      children: (
        <Card>
          <Table columns={orderColumns} dataSource={MOCK_ORDERS} rowKey="id" pagination={{ pageSize: 10 }} />
        </Card>
      ),
    },
    {
      key: 'packages',
      label: `🎁 Care Packages (${MOCK_CARE_PACKAGES.length})`,
      children: (
        <Card>
          <Table columns={packageColumns} dataSource={MOCK_CARE_PACKAGES} rowKey="id" pagination={{ pageSize: 10 }} />
        </Card>
      ),
    },
    {
      key: 'materials',
      label: `🛠️ Materials (${MOCK_MATERIALS.length})`,
      children: (
        <Card>
          <Table
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Type', dataIndex: 'type', key: 'type' },
              { title: 'Stock', dataIndex: 'stock', key: 'stock' },
              { title: 'Price', dataIndex: 'price', key: 'price', render: (price: number) => `₫${price.toLocaleString()}` },
            ]}
            dataSource={MOCK_MATERIALS}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
      <MainLayout title="Admin Dashboard">
        <Tabs items={tabs} />
      </MainLayout>
    </ProtectedRoute>
  );
}
