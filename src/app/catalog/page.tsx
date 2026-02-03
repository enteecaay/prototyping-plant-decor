'use client';

import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Space,
  Pagination,
  Empty,
  Spin,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import MainLayout from '@/components/MainLayout';
import PlantCard from '@/components/PlantCard';
import { useCatalogStore } from '@/store/catalog';
import { useCartStore } from '@/store/cart';
import { Plant } from '@/types';

const ITEMS_PER_PAGE = 12;

export default function CatalogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const {
    filteredPlants,
    categories,
    filterByCategory,
    searchPlants,
    selectedCategory,
  } = useCatalogStore();
  const { addItem } = useCartStore();

  const handleSearch = (value: string) => {
    searchPlants(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    filterByCategory(categoryId);
    setCurrentPage(1);
  };

  const handleAddToCart = (plant: Plant) => {
    addItem(plant, 1);
    // Show toast notification in production
    console.log(`Added ${plant.name} to cart`);
  };

  // Pagination
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedPlants = filteredPlants.slice(startIdx, endIdx);

  return (
    <MainLayout title="Plant Catalog">
      <div style={{ marginBottom: '32px' }}>
        {/* Search and Filter Bar */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search plants by name..."
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by category"
                onChange={handleCategoryChange}
                style={{ width: '100%' }}
                size="large"
                allowClear
                options={[
                  { label: 'All Categories', value: null },
                  ...categories.map((cat) => ({
                    label: cat.name,
                    value: cat.id,
                  })),
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Sort by"
                style={{ width: '100%' }}
                size="large"
                options={[
                  { label: 'Newest', value: 'newest' },
                  { label: 'Price: Low to High', value: 'price-asc' },
                  { label: 'Price: High to Low', value: 'price-desc' },
                  { label: 'Rating', value: 'rating' },
                  { label: 'Popularity', value: 'popularity' },
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* Results Info */}
        <div style={{ marginBottom: '16px', color: '#666' }}>
          <p>
            Showing {startIdx + 1}-{Math.min(endIdx, filteredPlants.length)} of{' '}
            {filteredPlants.length} plants
          </p>
        </div>

        {/* Plant Grid */}
        {filteredPlants.length === 0 ? (
          <Empty description="No plants found" style={{ marginTop: '50px', marginBottom: '50px' }} />
        ) : (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
              {paginatedPlants.map((plant) => (
                <Col xs={24} sm={12} md={8} lg={6} key={plant.id}>
                  <PlantCard
                    plant={plant}
                    onAddToCart={handleAddToCart}
                    showAddButton={true}
                    loading={loading}
                  />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {filteredPlants.length > ITEMS_PER_PAGE && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                <Pagination
                  current={currentPage}
                  pageSize={ITEMS_PER_PAGE}
                  total={filteredPlants.length}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
