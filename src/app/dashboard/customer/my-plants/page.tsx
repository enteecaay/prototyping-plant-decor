'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Space,
  message,
  Tooltip,
  Statistic,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { UserRole, PlantInstance } from '@/types';
import { MOCK_PLANT_INSTANCES, MOCK_PLANTS } from '@/mock-data';
import dayjs from 'dayjs';

const healthStatusColors: Record<string, string> = {
  excellent: 'green',
  good: 'blue',
  fair: 'orange',
  poor: 'red',
};

export default function MyPlantsPage() {
  const { user } = useAuthStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPlant, setEditingPlant] = useState<PlantInstance | null>(null);
  const [viewPlant, setViewPlant] = useState<PlantInstance | null>(null);
  const [form] = Form.useForm();

  // Mock user's plants
  const [userPlants, setUserPlants] = useState<PlantInstance[]>(
    MOCK_PLANT_INSTANCES.filter((p) => p.customerId === user?.id)
  );

  const handleAdd = () => {
    setEditingPlant(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (plant: PlantInstance) => {
    setEditingPlant(plant);
    form.setFieldsValue({
      ...plant,
      purchaseDate: dayjs(plant.purchaseDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (plantId: string) => {
    Modal.confirm({
      title: 'Delete Plant',
      content: 'Are you sure you want to remove this plant from your collection?',
      onOk: () => {
        setUserPlants(userPlants.filter((p) => p.id !== plantId));
        message.success('Plant removed from collection');
      },
    });
  };

  const handleSubmit = (values: any) => {
    if (editingPlant) {
      setUserPlants(
        userPlants.map((p) =>
          p.id === editingPlant.id
            ? { ...p, ...values, purchaseDate: values.purchaseDate.toDate() }
            : p
        )
      );
      message.success('Plant updated successfully');
    } else {
      const selectedPlant = MOCK_PLANTS.find((p) => p.id === values.plantId);
      const newPlant: PlantInstance = {
        id: `pi-${Date.now()}`,
        plantId: values.plantId || '',
        plantName: selectedPlant?.name || values.customName,
        plantImage: selectedPlant?.images?.[0] || '',
        customerId: user?.id || '',
        purchaseDate: values.purchaseDate.toDate(),
        quantity: 1,
        location: values.location,
        healthStatus: values.healthStatus,
        lastCaredDate: new Date(),
        careHistory: [],
        notes: values.notes || '',
      };
      setUserPlants([...userPlants, newPlant]);
      message.success('Plant added to collection');
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns: any[] = [
    {
      title: 'Plant Name',
      dataIndex: 'plantName',
      key: 'plantName',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Health Status',
      dataIndex: 'healthStatus',
      key: 'healthStatus',
      render: (status: string) => (
        <Tag color={healthStatusColors[status] || 'default'}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Last Care',
      dataIndex: 'lastCaredDate',
      key: 'lastCaredDate',
      render: (date: Date | undefined) =>
        date ? new Date(date).toLocaleDateString() : 'Not recorded',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PlantInstance) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setViewPlant(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const healthCounts = {
    total: userPlants.length,
    healthy: userPlants.filter((p) => p.healthStatus === 'excellent' || p.healthStatus === 'good').length,
    needsCare: userPlants.filter((p) => p.healthStatus === 'fair').length,
    sick: userPlants.filter((p) => p.healthStatus === 'poor').length,
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.CUSTOMER]}>
      <MainLayout title="My Plant Collection">
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="Total Plants" value={healthCounts.total} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Healthy"
                value={healthCounts.healthy}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Needs Care"
                value={healthCounts.needsCare}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Sick"
                value={healthCounts.sick}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="🌱 My Plants"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Plant
            </Button>
          }
        >
          {userPlants.length === 0 ? (
            <Empty
              description="You haven't added any plants yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={handleAdd}>
                Add Your First Plant
              </Button>
            </Empty>
          ) : (
            <Table
              dataSource={userPlants}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={editingPlant ? 'Edit Plant' : 'Add New Plant'}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Select from Catalog (optional)"
              name="plantId"
            >
              <Select
                placeholder="Choose a plant type"
                allowClear
                options={MOCK_PLANTS.map((p) => ({
                  label: p.name,
                  value: p.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Custom Plant Name"
              name="customName"
              rules={[{ required: true, message: 'Please enter plant name' }]}
            >
              <Input placeholder="Give your plant a name" />
            </Form.Item>

            <Form.Item
              label="Location"
              name="location"
              rules={[{ required: true }]}
            >
              <Input placeholder="Where is the plant located?" />
            </Form.Item>

            <Form.Item
              label="Health Status"
              name="healthStatus"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Current health"
                options={[
                  { label: '🌿 Excellent', value: 'excellent' },
                  { label: '👍 Good', value: 'good' },
                  { label: '🍂 Fair', value: 'fair' },
                  { label: '🥀 Poor', value: 'poor' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Purchase Date"
              name="purchaseDate"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Notes" name="notes">
              <Input.TextArea rows={3} placeholder="Any notes about this plant" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingPlant ? 'Update' : 'Add Plant'}
                </Button>
                <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* View Details Modal */}
        <Modal
          title="Plant Details"
          open={!!viewPlant}
          onCancel={() => setViewPlant(null)}
          footer={[
            <Button key="close" onClick={() => setViewPlant(null)}>
              Close
            </Button>,
          ]}
        >
          {viewPlant && (
            <div>
              <p><strong>Name:</strong> {viewPlant.plantName}</p>
              <p><strong>Location:</strong> {viewPlant.location}</p>
              <p>
                <strong>Health Status:</strong>{' '}
                <Tag color={healthStatusColors[viewPlant.healthStatus]}>
                  {viewPlant.healthStatus}
                </Tag>
              </p>
              <p><strong>Purchased:</strong> {new Date(viewPlant.purchaseDate).toLocaleDateString()}</p>
              <p><strong>Last Care:</strong> {viewPlant.lastCaredDate ? new Date(viewPlant.lastCaredDate).toLocaleDateString() : 'Not recorded'}</p>
              {viewPlant.notes && <p><strong>Notes:</strong> {viewPlant.notes}</p>}
            </div>
          )}
        </Modal>
      </MainLayout>
    </ProtectedRoute>
  );
}
