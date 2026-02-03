'use client';

import React from 'react';
import {
  Table,
  Card,
  Button,
  InputNumber,
  Space,
  Empty,
  Divider,
  Row,
  Col,
  Image,
  message,
} from 'antd';
import { DeleteOutlined, ShoppingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { CartItem } from '@/types';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleQuantityChange = (plantId: string, quantity: number | null) => {
    if (quantity && quantity > 0) {
      updateQuantity(plantId, quantity);
    }
  };

  const handleRemove = (plantId: string) => {
    removeItem(plantId);
    message.success('Item removed from cart');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      message.info('Please login to checkout');
      router.push('/auth/login');
      return;
    }
    router.push('/checkout');
  };

  const columns: any[] = [
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: CartItem) => (
        <Space>
          <Image
            src={record.plant?.image}
            alt={record.plant?.name}
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: '8px' }}
          />
          <div>
            <Link href={`/catalog/${record.plantId}`}>
              <strong>{record.plant?.name}</strong>
            </Link>
            <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>
              {record.plant?.scientificName}
            </p>
          </div>
        </Space>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      render: (_: any, record: CartItem) => (
        <span>₫{record.plant?.price.toLocaleString()}</span>
      ),
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (_: any, record: CartItem) => (
        <InputNumber
          min={1}
          max={record.plant?.stock || 99}
          value={record.quantity}
          onChange={(val) => handleQuantityChange(record.plantId, val)}
        />
      ),
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      render: (_: any, record: CartItem) => (
        <strong style={{ color: '#52c41a' }}>
          ₫{((record.plant?.price || 0) * record.quantity).toLocaleString()}
        </strong>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: CartItem) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(record.plantId)}
        >
          Remove
        </Button>
      ),
    },
  ];

  if (items.length === 0) {
    return (
      <MainLayout title="Shopping Cart">
        <Card>
          <Empty description="Your cart is empty">
            <Link href="/catalog">
              <Button type="primary" icon={<ShoppingOutlined />}>
                Browse Catalog
              </Button>
            </Link>
          </Empty>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Shopping Cart">
      <Link href="/catalog">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: '24px' }}>
          Continue Shopping
        </Button>
      </Link>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <Table
              columns={columns}
              dataSource={items}
              rowKey="plantId"
              pagination={false}
            />
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <Button danger onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Order Summary">
            <div style={{ marginBottom: '16px' }}>
              <Row justify="space-between">
                <span>Items ({items.length})</span>
                <span>₫{getTotal().toLocaleString()}</span>
              </Row>
              <Row justify="space-between" style={{ marginTop: '8px' }}>
                <span>Shipping</span>
                <span style={{ color: '#52c41a' }}>Free</span>
              </Row>
            </div>

            <Divider />

            <Row justify="space-between" style={{ fontSize: '18px', fontWeight: 'bold' }}>
              <span>Total</span>
              <span style={{ color: '#52c41a' }}>₫{getTotal().toLocaleString()}</span>
            </Row>

            <Button
              type="primary"
              size="large"
              block
              style={{ marginTop: '24px' }}
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>

            {!isAuthenticated && (
              <p style={{ textAlign: 'center', marginTop: '16px', color: '#999' }}>
                Please <Link href="/auth/login">login</Link> to checkout
              </p>
            )}
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
}
