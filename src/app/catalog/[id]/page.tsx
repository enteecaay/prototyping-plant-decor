'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Row,
  Col,
  Card,
  Image,
  Rate,
  Button,
  Space,
  Tag,
  Divider,
  InputNumber,
  Tabs,
  List,
  Avatar,
  Empty,
  Spin,
  message,
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useCatalogStore } from '@/store/catalog';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { Plant, PlantReview } from '@/types';

// Mock reviews
const MOCK_REVIEWS: PlantReview[] = [
  {
    id: 'review-1',
    plantId: 'plant-001',
    customerId: 'customer-001',
    customerName: 'Nguyen Van A',
    rating: 5,
    title: 'Beautiful plant!',
    comment: 'Arrived in perfect condition. Love it!',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'review-2',
    plantId: 'plant-001',
    customerId: 'customer-002',
    customerName: 'Tran Thi B',
    rating: 4,
    title: 'Great quality',
    comment: 'Very healthy plant. Packaging was excellent.',
    createdAt: new Date('2025-01-18'),
  },
];

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const plantId = params.id as string;
  const { getPlantById } = useCatalogStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const foundPlant = getPlantById(plantId);
      setPlant(foundPlant || null);
      // Set default variant if plant has variants
      if (foundPlant?.variants && foundPlant.variants.length > 0) {
        setSelectedVariant(foundPlant.variants[0].id);
      }
      setLoading(false);
    }, 300);
  }, [plantId, getPlantById]);

  const handleAddToCart = () => {
    if (plant) {
      addItem(plant, quantity, selectedVariant || undefined);
      message.success(`Added ${quantity} ${plant.name} to cart`);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    message.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!plant) {
    return (
      <MainLayout>
        <Empty description="Plant not found">
          <Link href="/catalog">
            <Button type="primary">Back to Catalog</Button>
          </Link>
        </Empty>
      </MainLayout>
    );
  }

  const reviews = MOCK_REVIEWS.filter((r) => r.plantId === plant.id);

  const tabs = [
    {
      key: 'care',
      label: '🌿 Care Instructions',
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <p><strong>💧 Watering:</strong> {plant.careInstructions.watering}</p>
              <p><strong>☀️ Sunlight:</strong> {plant.careInstructions.sunlight}</p>
              <p><strong>💨 Humidity:</strong> {plant.careInstructions.humidity}</p>
              <p><strong>🌡️ Temperature:</strong> {plant.careInstructions.temperature}</p>
            </Col>
            <Col xs={24} sm={12}>
              <p><strong>🧪 Fertilizing:</strong> {plant.careInstructions.fertilizing}</p>
              <p><strong>✂️ Pruning:</strong> {plant.careInstructions.pruning}</p>
              <p><strong>🌱 Propagation:</strong> {plant.careInstructions.propagation}</p>
              <p><strong>🐛 Common Pests:</strong> {plant.careInstructions.commonPests.join(', ')}</p>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'reviews',
      label: `⭐ Reviews (${reviews.length})`,
      children: (
        <Card>
          {reviews.length === 0 ? (
            <Empty description="No reviews yet" />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={reviews}
              renderItem={(review) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar>{review.customerName[0]}</Avatar>}
                    title={
                      <Space>
                        <span>{review.customerName}</span>
                        <Rate disabled value={review.rating} style={{ fontSize: '12px' }} />
                      </Space>
                    }
                    description={
                      <>
                        <strong>{review.title}</strong>
                        <p>{review.comment}</p>
                        <small style={{ color: '#999' }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </small>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      ),
    },
  ];

  return (
    <MainLayout>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        style={{ marginBottom: '24px' }}
      >
        Back
      </Button>

      <Row gutter={[24, 24]}>
        {/* Plant Image */}
        <Col xs={24} md={10}>
          <Card>
            <img
              src={plant.image}
              alt={plant.name}
              style={{ width: '100%', height: 'auto', minHeight: '300px', borderRadius: '8px', display: 'block' }}
            />
          </Card>
        </Col>

        {/* Plant Details */}
        <Col xs={24} md={14}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Tag color="green">{plant.category.name}</Tag>
                <Tag color={plant.difficulty === 'easy' ? 'green' : plant.difficulty === 'medium' ? 'orange' : 'red'}>
                  {plant.difficulty.toUpperCase()}
                </Tag>
              </div>

              <h1 style={{ margin: '8px 0' }}>{plant.name}</h1>
              <p style={{ color: '#999', fontStyle: 'italic' }}>{plant.scientificName}</p>

              <Space>
                <Rate allowHalf disabled value={plant.rating} />
                <span>({plant.reviewCount} reviews)</span>
              </Space>

              <h2 style={{ color: '#52c41a', margin: '16px 0' }}>
                ₫{plant.price.toLocaleString()}
              </h2>

              <p>{plant.description}</p>

              <Divider />

              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <p><strong>💧 Watering:</strong> {plant.wateringFrequency}</p>
                </Col>
                <Col span={12}>
                  <p><strong>☀️ Sunlight:</strong> {plant.sunlightRequirement}</p>
                </Col>
                <Col span={12}>
                  <p><strong>💨 Humidity:</strong> {plant.humidity}</p>
                </Col>
                <Col span={12}>
                  <p><strong>🌡️ Temperature:</strong> {plant.temperature}</p>
                </Col>
              </Row>

              <Divider />

              {/* Plant Variants - Individual bonsai trees with unique shapes */}
              {plant.variants && plant.variants.length > 0 && (
                <>
                  <div>
                    <h3 style={{ marginBottom: '12px' }}>🌳 Chọn cây bonsai bạn thích</h3>
                    <p style={{ color: '#666', marginBottom: '16px' }}>
                      Mỗi cây có dáng và hình thái riêng. Click vào ảnh để phóng to xem chi tiết.
                    </p>
                    <Row gutter={[16, 16]}>
                      {plant.variants
                        .filter((v) => !v.isSold)
                        .map((variant, index) => (
                          <Col xs={12} sm={8} md={6} key={variant.id}>
                            <Card
                              hoverable
                              onClick={() => setSelectedVariant(variant.id)}
                              style={{
                                cursor: 'pointer',
                                border:
                                  selectedVariant === variant.id
                                    ? '3px solid #52c41a'
                                    : '1px solid #d9d9d9',
                                height: '100%',
                              }}
                              cover={
                                <div style={{ position: 'relative' }}>
                                  <img
                                    src={variant.image}
                                    alt={`Bonsai Tree #${index + 1}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    style={{
                                      width: '100%',
                                      height: 200,
                                      objectFit: 'cover',
                                      display: 'block',
                                    }}
                                  />
                                  {selectedVariant === variant.id && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        background: '#52c41a',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      ✓ Đã chọn
                                    </div>
                                  )}
                                </div>
                              }
                            >
                              <Card.Meta
                                title={
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                                      Cây #{index + 1}
                                    </div>
                                    <div style={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}>
                                      ₫{variant.price.toLocaleString()}
                                    </div>
                                  </div>
                                }
                              />
                            </Card>
                          </Col>
                        ))}
                    </Row>
                  </div>
                  <Divider />
                </>
              )}

              <p>
                <strong>Stock:</strong>{' '}
                <span style={{ color: plant.stock > 0 ? '#52c41a' : '#f5222d' }}>
                  {plant.stock > 0 ? `${plant.stock} available` : 'Out of stock'}
                </span>
              </p>

              {plant.stock > 0 && (
                <Space size="large" style={{ marginTop: '16px' }}>
                  <InputNumber
                    min={1}
                    max={plant.stock}
                    value={quantity}
                    onChange={(val) => setQuantity(val || 1)}
                    style={{ width: '100px' }}
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    size="large"
                    icon={isWishlisted ? <HeartFilled style={{ color: '#f5222d' }} /> : <HeartOutlined />}
                    onClick={handleWishlist}
                  >
                    {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                  </Button>
                </Space>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: '32px' }}>
        <Tabs items={tabs} />
      </div>
    </MainLayout>
  );
}
