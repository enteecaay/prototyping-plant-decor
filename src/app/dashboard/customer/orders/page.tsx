'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Timeline,
  Row,
  Col,
  Statistic,
  Space,
  Tabs,
  Descriptions,
  Image,
} from 'antd';
import {
  EyeOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { UserRole, Order, OrderStatus } from '@/types';
import { MOCK_ORDERS, MOCK_PLANTS } from '@/mock-data';

const orderStatusColors: Record<string, string> = {
  PENDING: 'orange',
  CONFIRMED: 'blue',
  PROCESSING: 'cyan',
  SHIPPED: 'purple',
  DELIVERED: 'green',
  CANCELLED: 'red',
};

export default function MyOrdersPage() {
  const { user } = useAuthStore();
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  // Filter orders for current user
  const userOrders = MOCK_ORDERS.filter((o) => o.customerId === user?.id);

  const getPlantInfo = (plantId: string) => {
    return MOCK_PLANTS.find((p) => p.id === plantId);
  };

  const columns: any[] = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <strong>{id}</strong>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Items',
      key: 'items',
      render: (_: any, record: Order) => `${record.items.length} item(s)`,
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (amount: number) => `₫${amount.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={orderStatusColors[status] || 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Order) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => setViewOrder(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  const orderCounts = {
    total: userOrders.length,
    pending: userOrders.filter((o) => o.status === OrderStatus.PENDING).length,
    shipped: userOrders.filter((o) => o.status === OrderStatus.SHIPPED).length,
    delivered: userOrders.filter((o) => o.status === OrderStatus.DELIVERED).length,
  };

  const getOrderTimeline = (order: Order) => {
    const steps = [
      { status: OrderStatus.PENDING, label: 'Order Placed', icon: <ShoppingCartOutlined /> },
      { status: OrderStatus.CONFIRMED, label: 'Order Confirmed', icon: <CheckCircleOutlined /> },
      { status: OrderStatus.PROCESSING, label: 'Processing', icon: <ShoppingCartOutlined /> },
      { status: OrderStatus.SHIPPED, label: 'Shipped', icon: <CarOutlined /> },
      { status: OrderStatus.DELIVERED, label: 'Delivered', icon: <CheckCircleOutlined /> },
    ];

    const currentIndex = steps.findIndex((s) => s.status === order.status);

    return steps.map((step, index) => ({
      ...step,
      color: index <= currentIndex ? 'green' : 'gray',
    }));
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.CUSTOMER]}>
      <MainLayout title="My Orders">
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="Total Orders" value={orderCounts.total} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Pending"
                value={orderCounts.pending}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Shipped"
                value={orderCounts.shipped}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Delivered"
                value={orderCounts.delivered}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="📦 Order History">
          <Tabs
            defaultActiveKey="all"
            items={[
              {
                key: 'all',
                label: 'All Orders',
                children: (
                  <Table
                    dataSource={userOrders}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                ),
              },
              {
                key: 'pending',
                label: 'Pending',
                children: (
                  <Table
                    dataSource={userOrders.filter((o) => [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(o.status))}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                ),
              },
              {
                key: 'shipped',
                label: 'Shipped',
                children: (
                  <Table
                    dataSource={userOrders.filter((o) => o.status === OrderStatus.SHIPPED)}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                ),
              },
              {
                key: 'delivered',
                label: 'Delivered',
                children: (
                  <Table
                    dataSource={userOrders.filter((o) => o.status === OrderStatus.DELIVERED)}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                ),
              },
            ]}
          />
        </Card>

        {/* Order Details Modal */}
        <Modal
          title={`Order Details - ${viewOrder?.id}`}
          open={!!viewOrder}
          onCancel={() => setViewOrder(null)}
          width={800}
          footer={[
            <Button key="close" onClick={() => setViewOrder(null)}>
              Close
            </Button>,
          ]}
        >
          {viewOrder && (
            <>
              <Row gutter={24}>
                <Col span={14}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Order ID">
                      {viewOrder.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Order Date">
                      {new Date(viewOrder.createdAt).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={orderStatusColors[viewOrder.status]}>
                        {viewOrder.status}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Shipping Address">
                      {viewOrder.shippingAddress}
                    </Descriptions.Item>
                    <Descriptions.Item label="Payment Method">
                      {viewOrder.paymentMethod}
                    </Descriptions.Item>
                  </Descriptions>

                  <Card size="small" title="Order Items" style={{ marginTop: '16px' }}>
                    {viewOrder.items.map((item, index) => {
                      const plant = getPlantInfo(item.plantId);
                      return (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderBottom: '1px solid #f0f0f0',
                          }}
                        >
                          <Space>
                            <Image
                              src={plant?.images?.[0] || '/placeholder.png'}
                              width={40}
                              height={40}
                              alt={plant?.name || 'Plant'}
                              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                            />
                            <div>
                              <strong>{plant?.name || 'Unknown Plant'}</strong>
                              <div style={{ fontSize: '12px', color: '#999' }}>
                                Qty: {item.quantity} × ₫{item.price.toLocaleString()}
                              </div>
                            </div>
                          </Space>
                          <strong>₫{(item.quantity * item.price).toLocaleString()}</strong>
                        </div>
                      );
                    })}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        fontWeight: 'bold',
                        fontSize: '16px',
                      }}
                    >
                      <span>Total</span>
                      <span style={{ color: '#52c41a' }}>
                        ₫{viewOrder.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </Card>
                </Col>

                <Col span={10}>
                  <Card size="small" title="Order Timeline">
                    <Timeline
                      items={getOrderTimeline(viewOrder).map((step) => ({
                        color: step.color,
                        children: step.label,
                      }))}
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Modal>
      </MainLayout>
    </ProtectedRoute>
  );
}
