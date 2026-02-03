'use client';

import React, { useState } from 'react';
import {
  Steps,
  Card,
  Form,
  Input,
  Radio,
  Button,
  Row,
  Col,
  Divider,
  Table,
  Space,
  Result,
  message,
} from 'antd';
import {
  ShoppingCartOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';

const stepItems = [
  { title: 'Shipping', icon: <ShoppingCartOutlined /> },
  { title: 'Payment', icon: <CreditCardOutlined /> },
  { title: 'Review', icon: <CheckCircleOutlined /> },
  { title: 'Complete', icon: <CheckCircleOutlined /> },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        await form.validateFields();
        setCurrentStep(1);
      } catch (error) {
        // Validation failed
      }
    } else if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    // Mock order placement
    setTimeout(() => {
      const newOrderId = `ORD-${Date.now()}`;
      setOrderId(newOrderId);
      clearCart();
      setCurrentStep(3);
      setLoading(false);
      message.success('Order placed successfully!');
    }, 1500);
  };

  const columns: any[] = [
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: any) => (
        <span>{record.plant?.name}</span>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Price',
      key: 'price',
      render: (_: any, record: any) => (
        <span>₫{((record.plant?.price || 0) * record.quantity).toLocaleString()}</span>
      ),
    },
  ];

  // Order success screen
  if (currentStep === 3 && orderId) {
    return (
      <ProtectedRoute requiredRoles={[UserRole.CUSTOMER]}>
        <MainLayout>
          <Result
            status="success"
            title="Order Placed Successfully!"
            subTitle={`Order ID: ${orderId}. You will receive an email confirmation shortly.`}
            extra={[
              <Link href="/dashboard/customer" key="dashboard">
                <Button type="primary">Go to Dashboard</Button>
              </Link>,
              <Link href="/catalog" key="catalog">
                <Button>Continue Shopping</Button>
              </Link>,
            ]}
          />
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={[UserRole.CUSTOMER]}>
      <MainLayout title="Checkout">
        <Steps current={currentStep} style={{ marginBottom: '32px' }} items={stepItems} />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* Step 1: Shipping */}
            {currentStep === 0 && (
              <Card title="Shipping Information">
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    name: user?.name,
                    phone: user?.phone,
                    address: user?.address,
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Full Name"
                        name="name"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Your name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Phone"
                        name="phone"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Phone number" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    label="Shipping Address"
                    name="address"
                    rules={[{ required: true }]}
                  >
                    <Input.TextArea rows={3} placeholder="Full address" />
                  </Form.Item>
                  <Form.Item label="Notes (optional)" name="notes">
                    <Input.TextArea rows={2} placeholder="Delivery instructions" />
                  </Form.Item>
                </Form>
              </Card>
            )}

            {/* Step 2: Payment */}
            {currentStep === 1 && (
              <Card title="Payment Method">
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="credit_card" style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px', width: '100%' }}>
                      💳 Credit / Debit Card
                    </Radio>
                    <Radio value="bank_transfer" style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px', width: '100%' }}>
                      🏦 Bank Transfer
                    </Radio>
                    <Radio value="cod" style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px', width: '100%' }}>
                      💵 Cash on Delivery (COD)
                    </Radio>
                    <Radio value="momo" style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px', width: '100%' }}>
                      📱 MoMo E-Wallet
                    </Radio>
                  </Space>
                </Radio.Group>
              </Card>
            )}

            {/* Step 3: Review */}
            {currentStep === 2 && (
              <Card title="Review Your Order">
                <h4>Shipping Details</h4>
                <p><strong>Name:</strong> {form.getFieldValue('name')}</p>
                <p><strong>Phone:</strong> {form.getFieldValue('phone')}</p>
                <p><strong>Address:</strong> {form.getFieldValue('address')}</p>

                <Divider />

                <h4>Payment Method</h4>
                <p>{paymentMethod === 'credit_card' ? '💳 Credit / Debit Card' : paymentMethod === 'bank_transfer' ? '🏦 Bank Transfer' : paymentMethod === 'cod' ? '💵 Cash on Delivery' : '📱 MoMo E-Wallet'}</p>

                <Divider />

                <h4>Order Items</h4>
                <Table
                  columns={columns}
                  dataSource={items}
                  rowKey="plantId"
                  pagination={false}
                  size="small"
                />
              </Card>
            )}

            {/* Navigation Buttons */}
            <div style={{ marginTop: '24px' }}>
              <Space>
                {currentStep > 0 && (
                  <Button onClick={() => setCurrentStep(currentStep - 1)}>
                    Back
                  </Button>
                )}
                {currentStep < 2 && (
                  <Button type="primary" onClick={handleNext}>
                    Next
                  </Button>
                )}
                {currentStep === 2 && (
                  <Button
                    type="primary"
                    onClick={handlePlaceOrder}
                    loading={loading}
                  >
                    Place Order
                  </Button>
                )}
              </Space>
            </div>
          </Col>

          {/* Order Summary */}
          <Col xs={24} lg={8}>
            <Card title="Order Summary">
              <Table
                columns={columns}
                dataSource={items}
                rowKey="plantId"
                pagination={false}
                size="small"
                showHeader={false}
              />
              <Divider />
              <Row justify="space-between">
                <span>Subtotal</span>
                <span>₫{getTotal().toLocaleString()}</span>
              </Row>
              <Row justify="space-between" style={{ marginTop: '8px' }}>
                <span>Shipping</span>
                <span style={{ color: '#52c41a' }}>Free</span>
              </Row>
              <Divider />
              <Row justify="space-between" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                <span>Total</span>
                <span style={{ color: '#52c41a' }}>₫{getTotal().toLocaleString()}</span>
              </Row>
            </Card>
          </Col>
        </Row>
      </MainLayout>
    </ProtectedRoute>
  );
}
