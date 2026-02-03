'use client';

import React from 'react';
import { Button, Card, Row, Col, Statistic, Space } from 'antd';
import { ShoppingOutlined, TeamOutlined, GiftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <MainLayout title="Welcome to Plant Decor">
      <div style={{ marginBottom: '48px' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Total Plants"
              value={150}
              prefix={<ShoppingOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Happy Customers"
              value={2500}
              prefix={<TeamOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Care Services"
              value={350}
              prefix={<GiftOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Satisfaction Rate"
              value={98}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
          </Col>
        </Row>

        {!isAuthenticated ? (
          <Card style={{ marginBottom: '32px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'white', marginBottom: '16px' }}>
                Welcome to Plant Decor! 🌿
              </h2>
              <p style={{ color: 'white', marginBottom: '24px' }}>
                Discover beautiful plants and premium care services. Start your plant journey today!
              </p>
              <Space>
                <Link href="/auth/login">
                  <Button type="primary" size="large">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="large" style={{ background: 'white', color: '#667eea' }}>
                    Sign Up
                  </Button>
                </Link>
              </Space>
            </div>
          </Card>
        ) : (
          <Card style={{ marginBottom: '32px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'white', marginBottom: '16px' }}>
                Welcome back, {user?.name}! 👋
              </h2>
              <p style={{ color: 'white', marginBottom: '24px' }}>
                Role: <strong>{user?.role?.toUpperCase()}</strong>
              </p>
            </div>
          </Card>
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card hoverable>
              <h3>🌱 Browse Catalog</h3>
              <p>Explore our collection of beautiful plants from around the world.</p>
              <Link href="/catalog">
                <Button type="primary" block>
                  View Catalog
                </Button>
              </Link>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable>
              <h3>🧑‍🌾 Care Services</h3>
              <p>Get professional plant care service with certified caretakers.</p>
              <Button type="primary" block disabled>
                Learn More
              </Button>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable>
              <h3>📱 Track Orders</h3>
              <p>Real-time tracking for your plant orders and care service appointments.</p>
              {isAuthenticated && user?.role === 'customer' ? (
                <Link href="/dashboard/customer">
                  <Button type="primary" block>
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Button type="primary" block disabled>
                  Available for Customers
                </Button>
              )}
            </Card>
          </Col>
        </Row>

        {isAuthenticated && (
          <div style={{ marginTop: '32px', padding: '24px', background: '#fafafa', borderRadius: '8px' }}>
            <h3>📊 Quick Stats</h3>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic title="Your Account" value={user?.role} />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic title="Email" value={user?.email} />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic title="Joined" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic title="Status" value="Active" valueStyle={{ color: '#52c41a' }} />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
