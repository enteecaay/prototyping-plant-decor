'use client';

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Empty,
  message,
  Modal,
  Tag,
} from 'antd';
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  HeartFilled,
} from '@ant-design/icons';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserRole, Plant } from '@/types';
import { MOCK_PLANTS } from '@/mock-data';
import { useCartStore } from '@/store/cart';

export default function WishlistPage() {
  // Mock wishlist - in real app this would be from a store
  const [wishlist, setWishlist] = useState<Plant[]>(MOCK_PLANTS.slice(0, 3));
  const { addItem } = useCartStore();

  const handleRemove = (plantId: string) => {
    setWishlist(wishlist.filter((p) => p.id !== plantId));
    message.success('Removed from wishlist');
  };

  const handleAddToCart = (plant: Plant) => {
    addItem(plant, 1);
    message.success(`${plant.name} added to cart!`);
  };

  const handleMoveAllToCart = () => {
    Modal.confirm({
      title: 'Add all to cart?',
      content: `Add ${wishlist.length} items to your shopping cart?`,
      onOk: () => {
        wishlist.forEach((plant) => {
          addItem(plant, 1);
        });
        message.success('All items added to cart!');
      },
    });
  };

  const handleClearWishlist = () => {
    Modal.confirm({
      title: 'Clear wishlist?',
      content: 'Are you sure you want to remove all items from your wishlist?',
      onOk: () => {
        setWishlist([]);
        message.success('Wishlist cleared');
      },
    });
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.CUSTOMER]}>
      <MainLayout title="My Wishlist">
        <Card
          title={
            <span>
              <HeartFilled style={{ color: '#ff4d4f', marginRight: '8px' }} />
              My Wishlist ({wishlist.length} items)
            </span>
          }
          extra={
            wishlist.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button onClick={handleMoveAllToCart} type="primary">
                  Add All to Cart
                </Button>
                <Button danger onClick={handleClearWishlist}>
                  Clear All
                </Button>
              </div>
            )
          }
        >
          {wishlist.length === 0 ? (
            <Empty
              description="Your wishlist is empty"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Link href="/catalog">
                <Button type="primary">Browse Plants</Button>
              </Link>
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {wishlist.map((plant) => (
                <Col xs={24} sm={12} md={8} lg={6} key={plant.id}>
                  <Card
                    hoverable
                    cover={
                      <div
                        style={{
                          height: '200px',
                          background: `url(${plant.images?.[0] || '/placeholder.png'}) center/cover`,
                          position: 'relative',
                        }}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<HeartFilled />}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'white',
                            borderRadius: '50%',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(plant.id);
                          }}
                        />
                      </div>
                    }
                    actions={[
                      <Button
                        key="cart"
                        type="link"
                        icon={<ShoppingCartOutlined />}
                        onClick={() => handleAddToCart(plant)}
                        disabled={plant.stock === 0}
                      >
                        Add to Cart
                      </Button>,
                      <Button
                        key="remove"
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemove(plant.id)}
                      >
                        Remove
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Link href={`/catalog/${plant.id}`}>{plant.name}</Link>
                      }
                      description={
                        <>
                          <div
                            style={{
                              color: '#52c41a',
                              fontWeight: 'bold',
                              fontSize: '16px',
                            }}
                          >
                            ₫{plant.price.toLocaleString()}
                          </div>
                          <Tag color={plant.stock > 0 ? 'green' : 'red'}>
                            {plant.stock > 0 ? `${plant.stock} in stock` : 'Out of stock'}
                          </Tag>
                        </>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </MainLayout>
    </ProtectedRoute>
  );
}
