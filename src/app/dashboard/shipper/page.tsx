'use client';

import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tabs, Button, Tag, Space, Empty, Modal, Form, Input, Select } from 'antd';
import {
  TruckOutlined,
  CheckCircleOutlined,
  BgColorsOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { UserRole, OrderStatus } from '@/types';
import { MOCK_ORDERS } from '@/mock-data';

export default function ShipperDashboard() {
  const { user } = useAuthStore();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [orders, setOrders] = useState(
    MOCK_ORDERS.map((o) => ({
      ...o,
      shipperId: user?.id,
      shipperName: user?.name,
    }))
  );

  const shippedOrders = orders.filter((o) => o.status === OrderStatus.SHIPPED);
  const deliveredOrders = orders.filter((o) => o.status === OrderStatus.DELIVERED);
  const pendingOrders = orders.filter((o) => o.status === OrderStatus.PROCESSING);

  const handleStartDelivery = (record: any) => {
    setOrders(
      orders.map((o) =>
        o.id === record.id
          ? { ...o, status: OrderStatus.SHIPPED }
          : o
      )
    );
  };

  const handleCompleteDelivery = (record: any) => {
    setSelectedOrder(record);
    setModalVisible(true);
  };

  const handleSubmit = (values: any) => {
    setOrders(
      orders.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              status: OrderStatus.DELIVERED,
              deliveryDate: new Date(),
            }
          : o
      )
    );
    setModalVisible(false);
    form.resetFields();
  };

  const orderColumns: any[] = [
    { title: 'Order ID', dataIndex: 'id', key: 'id' },
    { title: 'Customer', dataIndex: 'customerId', key: 'customerId' },
    { title: 'Shipping Address', dataIndex: 'shippingAddress', key: 'shippingAddress' },
    { title: 'Total', dataIndex: 'totalPrice', key: 'totalPrice', render: (price: number) => `₫${price.toLocaleString()}` },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => {
        const colors: Record<OrderStatus, string> = {
          [OrderStatus.PENDING]: 'orange',
          [OrderStatus.CONFIRMED]: 'blue',
          [OrderStatus.PROCESSING]: 'processing',
          [OrderStatus.SHIPPED]: 'cyan',
          [OrderStatus.DELIVERED]: 'green',
          [OrderStatus.CANCELLED]: 'red',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          {record.status === OrderStatus.PROCESSING && (
            <Button type="primary" size="small" onClick={() => handleStartDelivery(record)}>
              Start Delivery
            </Button>
          )}
          {record.status === OrderStatus.SHIPPED && (
            <Button type="primary" size="small" onClick={() => handleCompleteDelivery(record)}>
              Confirm Delivery
            </Button>
          )}
        </Space>
      ),
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
              <Statistic title="Total Orders" value={orders.length} prefix={<TruckOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Pending" value={pendingOrders.length} prefix={<CalendarOutlined />} valueStyle={{ color: '#faad14' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="In Transit" value={shippedOrders.length} prefix={<BgColorsOutlined />} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Delivered" value={deliveredOrders.length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'pending',
      label: `📋 Pending (${pendingOrders.length})`,
      children: <Card><Table columns={orderColumns} dataSource={pendingOrders} rowKey="id" pagination={{ pageSize: 10 }} /></Card>,
    },
    {
      key: 'shipped',
      label: `📦 In Transit (${shippedOrders.length})`,
      children: <Card><Table columns={orderColumns} dataSource={shippedOrders} rowKey="id" pagination={{ pageSize: 10 }} /></Card>,
    },
    {
      key: 'delivered',
      label: `✅ Delivered (${deliveredOrders.length})`,
      children: <Card><Table columns={orderColumns} dataSource={deliveredOrders} rowKey="id" pagination={{ pageSize: 10 }} /></Card>,
    },
  ];

  return (
    <ProtectedRoute requiredRoles={[UserRole.SHIPPER]}>
      <MainLayout title="Shipper Dashboard">
        <Tabs items={tabs} />

        <Modal
          title="Confirm Delivery"
          open={modalVisible}
          onOk={form.submit}
          onCancel={() => setModalVisible(false)}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item label="Order ID">
              <Input value={selectedOrder?.id} disabled />
            </Form.Item>
            <Form.Item label="Delivery Signature / Notes" name="notes">
              <Input.TextArea rows={3} placeholder="Add delivery notes" />
            </Form.Item>
          </Form>
        </Modal>
      </MainLayout>
    </ProtectedRoute>
  );
}
