'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Timeline,
  Descriptions,
  Space,
  Typography,
  Image,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { useCareServiceStore } from '@/store/careService';
import { UserRole, CareServiceRequest, CareServiceStatus } from '@/types';

const { Text } = Typography;

const statusConfig: Record<CareServiceStatus, { color: string; label: string }> = {
  [CareServiceStatus.PENDING]: { color: 'orange', label: 'Chờ xác nhận' },
  [CareServiceStatus.CONFIRMED]: { color: 'blue', label: 'Đã xác nhận' },
  [CareServiceStatus.ASSIGNED]: { color: 'cyan', label: 'Đã phân công' },
  [CareServiceStatus.IN_PROGRESS]: { color: 'purple', label: 'Đang thực hiện' },
  [CareServiceStatus.COMPLETED]: { color: 'green', label: 'Hoàn thành' },
  [CareServiceStatus.CANCELLED]: { color: 'red', label: 'Đã hủy' },
  [CareServiceStatus.APPROVED]: { color: 'blue', label: 'Đã duyệt' },
  [CareServiceStatus.REJECTED]: { color: 'red', label: 'Đã từ chối' },
};

export default function CustomerCareServicesPage() {
  const { user } = useAuthStore();
  const { getRequestsByCustomer } = useCareServiceStore();
  const [viewService, setViewService] = useState<CareServiceRequest | null>(null);

  const services = getRequestsByCustomer(user?.id || '');

  const columns = [
    {
      title: 'Mã dịch vụ',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text strong>{id}</Text>,
    },
    {
      title: 'Gói dịch vụ',
      dataIndex: 'packageName',
      key: 'packageName',
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date: Date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: CareServiceStatus) => (
        <Tag color={statusConfig[status].color}>{statusConfig[status].label}</Tag>
      ),
    },
    {
      title: 'Nhân viên',
      key: 'caretaker',
      render: (_: any, record: CareServiceRequest) => (
        record.currentCaretakerName ? (
          <Space direction="vertical" size={0}>
            <Text>{record.currentCaretakerName}</Text>
            {record.mainCaretakerId !== record.currentCaretakerId && (
              <Text type="secondary" style={{ fontSize: '11px' }}>
                (Hỗ trợ bởi {record.currentCaretakerName})
              </Text>
            )}
          </Space>
        ) : (
          <Text type="secondary">Chưa phân công</Text>
        )
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {price.toLocaleString('vi-VN')}đ
        </Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: CareServiceRequest) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => setViewService(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRoles={[UserRole.CUSTOMER]}>
      <MainLayout title="Dịch vụ Chăm sóc Cây của tôi">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Space>
              <Link href="/dashboard/customer/care-service">
                <Button type="primary" icon={<PlusOutlined />} size="large">
                  Đặt lịch chăm sóc mới
                </Button>
              </Link>
            </Space>
          </Card>

          <Card>
            <Table
              columns={columns}
              dataSource={services}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'Chưa có dịch vụ nào' }}
            />
          </Card>
        </Space>

        {/* Detail Modal */}
        <Modal
          title={`Chi tiết dịch vụ - ${viewService?.id}`}
          open={!!viewService}
          onCancel={() => setViewService(null)}
          footer={[
            <Button key="close" onClick={() => setViewService(null)}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {viewService && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Gói dịch vụ" span={2}>
                  <Text strong>{viewService.packageName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày hẹn">
                  {new Date(viewService.scheduledDate).toLocaleString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={statusConfig[viewService.status].color}>
                    {statusConfig[viewService.status].label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  {viewService.workAddress || viewService.customerAddress}
                </Descriptions.Item>
                <Descriptions.Item label="Nhân viên chính">
                  {viewService.mainCaretakerName || 'Chưa phân công'}
                </Descriptions.Item>
                <Descriptions.Item label="Đang thực hiện">
                  {viewService.currentCaretakerName || 'Chưa bắt đầu'}
                </Descriptions.Item>
                {viewService.plantNames.length > 0 && (
                  <Descriptions.Item label="Cây cần chăm sóc" span={2}>
                    {viewService.plantNames.join(', ')}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Phí gốc">
                  {viewService.basePrice.toLocaleString('vi-VN')}đ
                </Descriptions.Item>
                <Descriptions.Item label="Phí phát sinh">
                  {viewService.addOnTotal.toLocaleString('vi-VN')}đ
                </Descriptions.Item>
                <Descriptions.Item label="Tổng cộng" span={2}>
                  <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                    {viewService.totalPrice.toLocaleString('vi-VN')}đ
                  </Text>
                </Descriptions.Item>
                {viewService.customerNotes && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {viewService.customerNotes}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* Add-on Services */}
              {viewService.addOnServices.length > 0 && (
                <>
                  <Text strong style={{ fontSize: '16px' }}>Dịch vụ phát sinh:</Text>
                  <Table
                    size="small"
                    dataSource={viewService.addOnServices}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      { title: 'Tên dịch vụ', dataIndex: 'name', key: 'name' },
                      { title: 'Mô tả', dataIndex: 'description', key: 'description' },
                      {
                        title: 'Giá',
                        dataIndex: 'price',
                        key: 'price',
                        render: (p: number) => `${p.toLocaleString('vi-VN')}đ`,
                      },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        key: 'status',
                        render: (s: string) => (
                          <Tag color={s === 'approved' ? 'green' : s === 'rejected' ? 'red' : 'orange'}>
                            {s === 'approved' ? 'Đã duyệt' : s === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                          </Tag>
                        ),
                      },
                    ]}
                  />
                </>
              )}

              {/* Progress Timeline */}
              {viewService.progressLogs.length > 0 && (
                <>
                  <Text strong style={{ fontSize: '16px' }}>
                    <ClockCircleOutlined /> Tiến độ thực hiện:
                  </Text>
                  <Timeline
                    items={viewService.progressLogs.map((log) => ({
                      color: log.action === 'Check-in' ? 'blue' : log.action.includes('Handover') ? 'orange' : 'green',
                      children: (
                        <Space direction="vertical" size={0}>
                          <Text strong>{log.action}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {log.caretakerName} - {new Date(log.timestamp).toLocaleString('vi-VN')}
                          </Text>
                          <Text>{log.description}</Text>
                          {log.photos && log.photos.length > 0 && (
                            <Image.PreviewGroup>
                              {log.photos.map((photo, idx) => (
                                <Image
                                  key={idx}
                                  width={100}
                                  src={photo}
                                  alt={`Progress ${idx + 1}`}
                                  style={{ marginRight: '8px', borderRadius: '4px' }}
                                />
                              ))}
                            </Image.PreviewGroup>
                          )}
                        </Space>
                      ),
                    }))}
                  />
                </>
              )}

              {viewService.status === CareServiceStatus.PENDING && (
                <Alert
                  message="Đang chờ xác nhận"
                  description="Nhân viên hỗ trợ sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận thông tin và thời gian cụ thể."
                  type="info"
                  showIcon
                />
              )}

              {viewService.status === CareServiceStatus.COMPLETED && (
                <Alert
                  message="Dịch vụ đã hoàn thành"
                  description="Cảm ơn bạn đã sử dụng dịch vụ. Hóa đơn chi tiết đã được gửi qua email."
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                />
              )}
            </Space>
          )}
        </Modal>
      </MainLayout>
    </ProtectedRoute>
  );
}
