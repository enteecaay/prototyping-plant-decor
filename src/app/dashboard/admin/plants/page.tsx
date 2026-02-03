'use client';

import React, { useState } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, message, Tabs, Upload, Image as AntImage } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { useCatalogStore } from '@/store/catalog';
import { UserRole, Plant, PlantVariant, CareInstruction } from '@/types';

export default function PlantManagement() {
  const { user } = useAuthStore();
  const {
    plants,
    categories,
    addPlant,
    updatePlant,
    deletePlant,
    addPlantVariant,
    deletePlantVariant,
  } = useCatalogStore();

  // Modal states
  const [plantModalVisible, setPlantModalVisible] = useState(false);
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isEditingPlant, setIsEditingPlant] = useState(false);
  const [activeTab, setActiveTab] = useState('plants');

  const [plantForm] = Form.useForm();
  const [variantForm] = Form.useForm();

  // Default care instructions
  const defaultCareInstructions: CareInstruction = {
    watering: '',
    sunlight: '',
    humidity: '',
    temperature: '',
    fertilizing: '',
    pruning: '',
    commonPests: [],
    propagation: '',
  };

  // Plant Management
  const handleAddPlant = () => {
    setIsEditingPlant(false);
    setSelectedPlant(null);
    plantForm.resetFields();
    setPlantModalVisible(true);
  };

  const handleEditPlant = (plant: Plant) => {
    setIsEditingPlant(true);
    setSelectedPlant(plant);
    plantForm.setFieldsValue({
      name: plant.name,
      scientificName: plant.scientificName,
      categoryId: plant.category.id,
      description: plant.description,
      price: plant.price,
      stock: plant.stock,
      difficulty: plant.difficulty,
      wateringFrequency: plant.wateringFrequency,
      sunlightRequirement: plant.sunlightRequirement,
      humidity: plant.humidity,
      temperature: plant.temperature,
      image: plant.image,
      rating: plant.rating,
      reviewCount: plant.reviewCount,
    });
    setPlantModalVisible(true);
  };

  const handleDeletePlant = (id: string) => {
    Modal.confirm({
      title: 'Delete Plant',
      content: 'Are you sure you want to delete this plant?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        deletePlant(id);
        message.success('Plant deleted successfully');
      },
    });
  };

  const handlePlantSubmit = async (values: any) => {
    try {
      const categoryData = categories.find((c) => c.id === values.categoryId);
      if (!categoryData) {
        message.error('Category not found');
        return;
      }

      const plantData: Plant = {
        id: isEditingPlant && selectedPlant ? selectedPlant.id : `plant-${Date.now()}`,
        name: values.name,
        scientificName: values.scientificName,
        category: categoryData,
        description: values.description,
        price: values.price,
        image: values.image || 'https://picsum.photos/seed/plant/400/400',
        stock: values.stock,
        difficulty: values.difficulty,
        wateringFrequency: values.wateringFrequency,
        sunlightRequirement: values.sunlightRequirement,
        humidity: values.humidity,
        temperature: values.temperature,
        rating: values.rating || 4.5,
        reviewCount: values.reviewCount || 0,
        careInstructions: defaultCareInstructions,
        variants: isEditingPlant && selectedPlant ? selectedPlant.variants : [],
        createdAt: isEditingPlant && selectedPlant ? selectedPlant.createdAt : new Date(),
        updatedAt: new Date(),
      };

      if (isEditingPlant && selectedPlant) {
        updatePlant(selectedPlant.id, plantData);
        message.success('Plant updated successfully');
      } else {
        addPlant(plantData);
        message.success('Plant added successfully');
      }

      setPlantModalVisible(false);
      plantForm.resetFields();
      setSelectedPlant(null);
    } catch (error) {
      message.error('Failed to save plant');
    }
  };

  // Variant Management
  const handleAddVariant = (plant: Plant) => {
    setSelectedPlant(plant);
    variantForm.resetFields();
    setVariantModalVisible(true);
  };

  const handleDeleteVariant = (plantId: string, variantId: string) => {
    Modal.confirm({
      title: 'Delete Plant Variant',
      content: 'Are you sure you want to delete this plant instance (variant)?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        deletePlantVariant(plantId, variantId);
        message.success('Plant instance deleted successfully');
      },
    });
  };

  const handleVariantSubmit = async (values: any) => {
    try {
      if (!selectedPlant) {
        message.error('Please select a plant');
        return;
      }

      const variant: PlantVariant = {
        id: `variant-${Date.now()}`,
        plantId: selectedPlant.id,
        image: values.image || 'https://picsum.photos/seed/variant/600/600',
        price: values.price,
        stock: 1,
        isSold: false,
      };

      addPlantVariant(selectedPlant.id, variant);
      message.success('Plant instance (variant) added successfully');
      setVariantModalVisible(false);
      variantForm.resetFields();
      setSelectedPlant(null);
    } catch (error) {
      message.error('Failed to add plant instance');
    }
  };

  // Table Columns
  const plantColumns: any[] = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image: string) => (
        <AntImage
          src={image}
          alt="plant"
          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
        />
      ),
    },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 150 },
    { title: 'Scientific Name', dataIndex: 'scientificName', key: 'scientificName', width: 150 },
    { title: 'Category', dataIndex: ['category', 'name'], key: 'category', width: 120 },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `₫${price.toLocaleString()}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      render: (stock: number) => <Tag color={stock > 0 ? 'green' : 'red'}>{stock}</Tag>,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (rating: number) => `⭐ ${rating.toFixed(1)}`,
    },
    {
      title: 'Variants',
      key: 'variants',
      width: 80,
      render: (_: any, record: Plant) => (
        <Tag color="blue">{record.variants?.length || 0}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: any, record: Plant) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditPlant(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleAddVariant(record)}
          >
            Add Instance
          </Button>
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePlant(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Variant Table Component
  const VariantTable = ({ plant }: { plant: Plant }) => {
    const variantColumns: any[] = [
      {
        title: 'Image',
        dataIndex: 'image',
        key: 'image',
        width: 80,
        render: (image: string) => (
          <AntImage
            src={image}
            alt="variant"
            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
          />
        ),
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        render: (price: number) => `₫${price.toLocaleString()}`,
      },
      {
        title: 'Status',
        dataIndex: 'isSold',
        key: 'isSold',
        render: (isSold: boolean) => (
          <Tag color={isSold ? 'red' : 'green'}>{isSold ? 'Sold' : 'Available'}</Tag>
        ),
      },
      {
        title: 'Actions',
        key: 'action',
        render: (_: any, record: PlantVariant) => (
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteVariant(plant.id, record.id)}
          >
            Delete
          </Button>
        ),
      },
    ];

    return (
      <Table
        columns={variantColumns}
        dataSource={plant.variants || []}
        rowKey="id"
        pagination={false}
        size="small"
      />
    );
  };

  const tabs = [
    {
      key: 'plants',
      label: '🌿 Plant Catalog',
      children: (
        <Card
          title="Plant Management"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPlant}>
              Add New Plant
            </Button>
          }
        >
          <Table
            columns={plantColumns}
            dataSource={plants}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
          />
        </Card>
      ),
    },
    {
      key: 'variants',
      label: '🌱 Plant Instances (Variants)',
      children: (
        <Card title="Plant Instances Management">
          {plants.length === 0 ? (
            <p>No plants available. Please add plants first.</p>
          ) : (
            <Tabs
              items={plants.map((plant) => ({
                key: plant.id,
                label: `${plant.name} (${plant.variants?.length || 0})`,
                children: (
                  <div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddVariant(plant)}
                      style={{ marginBottom: '16px' }}
                    >
                      Add New Instance
                    </Button>
                    <VariantTable plant={plant} />
                  </div>
                ),
              }))}
            />
          )}
        </Card>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPPORT_STAFF]}>
      <MainLayout title="Plant Management">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />

        {/* Plant Modal */}
        <Modal
          title={isEditingPlant ? 'Edit Plant' : 'Add New Plant'}
          open={plantModalVisible}
          onCancel={() => {
            setPlantModalVisible(false);
            plantForm.resetFields();
            setSelectedPlant(null);
          }}
          footer={[
            <Button key="cancel" onClick={() => setPlantModalVisible(false)}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={() => plantForm.submit()}>
              {isEditingPlant ? 'Update' : 'Add'} Plant
            </Button>,
          ]}
          width={700}
        >
          <Form
            form={plantForm}
            layout="vertical"
            onFinish={handlePlantSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Plant Name"
                  name="name"
                  rules={[{ required: true, message: 'Please enter plant name' }]}
                >
                  <Input placeholder="e.g., Monstera Deliciosa" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Scientific Name"
                  name="scientificName"
                  rules={[{ required: true, message: 'Please enter scientific name' }]}
                >
                  <Input placeholder="e.g., Monstera deliciosa" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Category"
                  name="categoryId"
                  rules={[{ required: true, message: 'Please select category' }]}
                >
                  <Select placeholder="Select category">
                    {categories.map((cat) => (
                      <Select.Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Difficulty Level"
                  name="difficulty"
                  rules={[{ required: true, message: 'Please select difficulty' }]}
                >
                  <Select placeholder="Select difficulty">
                    <Select.Option value="easy">Easy</Select.Option>
                    <Select.Option value="medium">Medium</Select.Option>
                    <Select.Option value="hard">Hard</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <Input.TextArea rows={3} placeholder="Enter plant description" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Price (₫)"
                  name="price"
                  rules={[{ required: true, message: 'Please enter price' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Stock"
                  name="stock"
                  rules={[{ required: true, message: 'Please enter stock' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Image URL"
                  name="image"
                >
                  <Input placeholder="https://example.com/image.jpg" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Watering Frequency"
                  name="wateringFrequency"
                >
                  <Input placeholder="e.g., Every 5-7 days" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Sunlight Requirement"
                  name="sunlightRequirement"
                >
                  <Input placeholder="e.g., Bright, indirect light" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Humidity"
                  name="humidity"
                >
                  <Input placeholder="e.g., 50-60%" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Temperature"
                  name="temperature"
                >
                  <Input placeholder="e.g., 18-27°C" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Rating"
                  name="rating"
                >
                  <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Review Count"
                  name="reviewCount"
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Variant Modal */}
        <Modal
          title="Add Plant Instance (Variant like Bonsai)"
          open={variantModalVisible}
          onCancel={() => {
            setVariantModalVisible(false);
            variantForm.resetFields();
            setSelectedPlant(null);
          }}
          footer={[
            <Button key="cancel" onClick={() => setVariantModalVisible(false)}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={() => variantForm.submit()}>
              Add Instance
            </Button>,
          ]}
          width={600}
        >
          {selectedPlant && (
            <div style={{ marginBottom: '16px' }}>
              <p>
                <strong>Plant:</strong> {selectedPlant.name}
              </p>
              <p style={{ fontSize: '12px', color: '#666' }}>
                Note: Each instance is a unique individual plant with stock = 1
              </p>
            </div>
          )}
          <Form
            form={variantForm}
            layout="vertical"
            onFinish={handleVariantSubmit}
          >
            <Form.Item
              label="Instance Image URL"
              name="image"
              rules={[{ required: true, message: 'Please enter image URL' }]}
            >
              <Input placeholder="https://example.com/bonsai-tree-image.jpg" />
            </Form.Item>

            <Form.Item
              label="Price (₫)"
              name="price"
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="Enter price for this specific instance" />
            </Form.Item>

            <p style={{ fontSize: '12px', color: '#999', marginTop: '16px' }}>
              💡 Tip: For bonsai trees or other unique plants, each instance should have a unique photo and may have different pricing based on the specific tree's quality and age.
            </p>
          </Form>
        </Modal>
      </MainLayout>
    </ProtectedRoute>
  );
}
