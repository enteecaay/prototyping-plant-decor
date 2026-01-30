'use client';

import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tabs,
  Button,
  Space,
  Empty,
  Badge,
  Tag,
  Spin,
} from 'antd';
import {
  ShoppingOutlined,
  HeartOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  CoffeeOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { UserRole, Order, OrderStatus, CareServiceRequest, CareServiceStatus, PlantInstance } from '@/types';
import {
  MOCK_ORDERS,
  MOCK_CARE_SERVICE_REQUESTS,
  MOCK_PLANT_INSTANCES,
} from '@/mock-data';

export default function CustomerDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [careServices, setCareServices] = useState<CareServiceRequest[]>([]);
  const [plants, setPlants] = useState<PlantInstance[]>([]);

  useEffect(() => {
    // Load mock data for customer
    if (user?.id) {
      setLoading(true);
      setTimeout(() => {
        setOrders(MOCK_ORDERS.filter((o) => o.customerId === user.id));
        setCareServices(
          MOCK_CARE_SERVICE_REQUESTS.filter((c) => c.customerId === user.id)
        );
        setPlants(MOCK_PLANT_INSTANCES.filter((p) => p.customerId === user.id));
        setLoading(false);
      }, 500);
    }
  }, [user?.id]);

  const getStatusColor = (status: OrderStatus | CareServiceStatus) => {
    const orderColors: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'orange',
      [OrderStatus.CONFIRMED]: 'blue',
      [OrderStatus.PROCESSING]: 'processing',
      [OrderStatus.SHIPPED]: 'cyan',
      [OrderStatus.DELIVERED]: 'green',
      [OrderStatus.CANCELLED]: 'red',
    };

    const careColors: Record<CareServiceStatus, string> = {
        [CareServiceStatus.PENDING]: 'orange',
        [CareServiceStatus.APPROVED]: 'green',
        [CareServiceStatus.REJECTED]: 'red',
        [CareServiceStatus.IN_PROGRESS]: 'processing',
        [CareServiceStatus.COMPLETED]: 'green',
        [CareServiceStatus.CANCELLED]: 'red',
        [CareServiceStatus.CONFIRMED]: '',
        [CareServiceStatus.ASSIGNED]: ''
    };

    return (orderColors[status as OrderStatus] || careColors[status as CareServiceStatus] || 'default');
  };

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Link href={`/dashboard/customer/orders/${id}`}>{id}</Link>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `₫${price.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Order) => (
        <Link href={`/dashboard/customer/orders/${record.id}`}>
          <Button type="link">View Details</Button>
        </Link>
      ),
    },
  ];

  const careServiceColumns = [
    {
      title: 'Service ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Package',
      dataIndex: 'packageName',
      key: 'packageName',
    },
    {
      title: 'Plants',
      dataIndex: 'plantNames',
      key: 'plantNames',
      render: (names: string[]) => names.join(', '),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: CareServiceStatus) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Caretaker',
      dataIndex: 'assignedCaretakerName',
      key: 'assignedCaretakerName',
      render: (name: string | undefined) => name || 'Not assigned',
    },
  ];

  const plantColumns = [
    {
      title: 'Plant Name',
      dataIndex: 'plantName',
      key: 'plantName',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Health Status',
      dataIndex: 'healthStatus',
      key: 'healthStatus',
      render: (status: string) => {
        const colors: Record<string, string> = {
          excellent: 'green',
          good: 'blue',
          fair: 'orange',
          poor: 'red',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Last Cared',
      dataIndex: 'lastCaredDate',
      key: 'lastCaredDate',
      render: (date: Date | undefined) =>
        date ? new Date(date).toLocaleDateString() : 'Never',
    },
  ];

  const tabs = [
    {
      key: 'overview',
      label: '📊 Overview',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={orders.length}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pending Orders"
                value={orders.filter((o) => o.status === OrderStatus.PENDING).length}
                prefix={<CoffeeOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Active Services"
                value={careServices.filter(
                  (c) => c.status === CareServiceStatus.APPROVED
                ).length}
                prefix={<CreditCardOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="My Plants"
                value={plants.length}
                prefix={<HeartOutlined />}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'orders',
      label: `🛍️ Orders (${orders.length})`,
      children: (
        <Card>
          {orders.length === 0 ? (
            <Empty description="No orders yet" />
          ) : (
            <Table
              columns={orderColumns}
              dataSource={orders}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      ),
    },
    {
      key: 'care-services',
      label: `🌿 Care Services (${careServices.length})`,
      children: (
        <Card>
          {careServices.length === 0 ? (
            <Empty description="No care services registered" />
          ) : (
            <Table
              columns={careServiceColumns}
              dataSource={careServices}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      ),
    },
    {
      key: 'my-plants',
      label: `🪴 My Plants (${plants.length})`,
      children: (
        <Card>
          {plants.length === 0 ? (
            <Empty description="No plants yet" />
          ) : (
            <Table
              columns={plantColumns}
              dataSource={plants}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRoles={[UserRole.CUSTOMER]}>
      <MainLayout title={`Welcome, ${user?.name}! 👋`}>
        <Spin spinning={loading}>
          <div style={{ marginBottom: '32px' }}>
            <Tabs items={tabs} />

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <Space wrap>
                <Link href="/catalog">
                  <Button type="primary" size="large" icon={<ShoppingOutlined />}>
                    Browse Catalog
                  </Button>
                </Link>
                <Link href="/dashboard/customer/care-service">
                  <Button type="default" size="large" icon={<CalendarOutlined />}>
                    Register Care Service
                  </Button>
                </Link>
                <Link href="/dashboard/customer/my-plants">
                  <Button type="default" size="large" icon={<HeartOutlined />}>
                    My Plants
                  </Button>
                </Link>
                <Link href="/dashboard/customer/orders">
                  <Button type="default" size="large" icon={<FileTextOutlined />}>
                    My Orders
                  </Button>
                </Link>
                <Link href="/dashboard/customer/wishlist">
                  <Button type="default" size="large">
                    ❤️ Wishlist
                  </Button>
                </Link>
                <Link href="/dashboard/customer/chat">
                  <Button type="default" size="large">
                    💬 Chat Support
                  </Button>
                </Link>
              </Space>
            </div>
          </div>
        </Spin>
      </MainLayout>
    </ProtectedRoute>
  );
}
