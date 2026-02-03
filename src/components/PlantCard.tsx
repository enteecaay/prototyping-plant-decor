'use client';

import React from 'react';
import { Card, Rate, Button, Space, Image, Empty, Spin } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Plant } from '@/types';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';

interface PlantCardProps {
  plant: Plant;
  onAddToCart?: (plant: Plant) => void;
  showAddButton?: boolean;
  loading?: boolean;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  onAddToCart,
  showAddButton = true,
  loading = false,
}) => {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(plant);
    } else {
      useCartStore.getState().addItem(plant, 1);
    }
  };

  if (loading) {
    return <Spin />;
  }

  if (!plant) {
    return <Empty description="Plant not found" />;
  }

  return (
    <Card
      hoverable
      cover={
        <img
          alt={plant.name}
          src={plant.image}
          style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
        />
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <Link
        href={`/catalog/${plant.id}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <h3 style={{ margin: '0 0 8px 0' }}>{plant.name}</h3>
        <p style={{ color: '#999', fontSize: '12px', margin: '0 0 12px 0' }}>
          {plant.scientificName}
        </p>
      </Link>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '12px', margin: '0 0 12px 0' }}>
          <strong>Category:</strong> {plant.category.name}
        </p>
        <p style={{ fontSize: '12px', margin: '0 0 12px 0' }}>
          <strong>Difficulty:</strong> {plant.difficulty}
        </p>
      </div>

      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Rate allowHalf disabled value={plant.rating} />
          <span style={{ marginLeft: '8px', fontSize: '12px' }}>
            ({plant.reviewCount})
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
            ₫{plant.price.toLocaleString()}
          </span>
          <span
            style={{
              fontSize: '12px',
              color: plant.stock > 0 ? '#52c41a' : '#f5222d',
            }}
          >
            {plant.stock > 0 ? `${plant.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        {showAddButton && plant.stock > 0 && (
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            block
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        )}
      </Space>
    </Card>
  );
};

export default PlantCard;
