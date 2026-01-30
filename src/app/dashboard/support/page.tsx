'use client';

import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tabs, Button, Tag, Space, Modal, Form, Input, Select, message, Descriptions, Alert } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  TeamOutlined,
  MessageOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { useCareServiceStore } from '@/store/careService';
import { UserRole, CareServiceStatus, CareServiceRequest, ServicePackageType, CaretakerStatus } from '@/types';

export default function SupportStaffDashboard() {
  const { user } = useAuthStore();
  const {
    requests,
    caretakers,
    confirmRequest,
    assignCaretaker,
    cancelRequest,
    getAvailableCaretakers,
  } = useCareServiceStore();

  const [selectedRequest, setSelectedRequest] = useState<CareServiceRequest | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedCaretaker, setSelectedCaretaker] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [form] = Form.useForm();

  const pendingRequests = requests.filter((r) => r.status === CareServiceStatus.PENDING);
  const confirmedRequests = requests.filter((r) => r.status === CareServiceStatus.CONFIRMED);
  const activeRequests = requests.filter(
    (r) => r.status === CareServiceStatus.ASSIGNED || r.status === CareServiceStatus.IN_PROGRESS
  );
  
  // Mock data for pending chat support requests
  const pendingChatRequests = 3;

  const handleConfirm = (record: CareServiceRequest) => {
    setSelectedRequest(record);
    setConfirmModalVisible(true);
  };

  const handleAssign = (record: CareServiceRequest) => {
    setSelectedRequest(record);
    setAssignModalVisible(true);
  };

  const handleViewDetail = (record: CareServiceRequest) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  const handleCancel = (id: string) => {
    Modal.confirm({
      title: 'Hủy yêu cầu dịch vụ',
      content: 'Bạn có chắc chắn muốn hủy yêu cầu này?',
      onOk: () => {
        cancelRequest(id);
        message.success('Đã hủy yêu cầu dịch vụ');
      },
    });
  };

  const handleConfirmSubmit = () => {
    if (!selectedRequest) return;
    confirmRequest(selectedRequest.id, user?.id || '');
    message.success('Đã xác nhận yêu cầu dịch vụ! Tiếp theo hãy phân công nhân viên.');
    setConfirmModalVisible(false);
    setSelectedRequest(null);
  };

  const handleAssignSubmit = () => {
    if (!selectedRequest || !selectedCaretaker) return;
    const caretaker = caretakers.find((c) => c.userId === selectedCaretaker);
    if (caretaker) {
      assignCaretaker(selectedRequest.id, caretaker.userId, caretaker.name);
      message.success(`Đã phân công cho ${caretaker.name}`);
      setAssignModalVisible(false);
      setSelectedCaretaker('');
      setSelectedRequest(null);
    }
  };

  const handleCancelRequest = () => {
    if (!selectedRequest || !cancelReason.trim()) {
      message.warning('Vui lòng nhập lý do hủy');
      return;
    }
    cancelRequest(selectedRequest.id);
    message.success(`Đã hủy yêu cầu dịch vụ. Lý do: ${cancelReason}`);
    setCancelModalVisible(false);
    setSelectedRequest(null);
    setCancelReason('');
  };

  const careRequestColumns: any[] = [
    { title: 'Mã DV', dataIndex: 'id', key: 'id', width: 120 },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { title: 'SĐT', dataIndex: 'customerPhone', key: 'customerPhone', width: 120 },
    { title: 'Gói dịch vụ', dataIndex: 'packageName', key: 'packageName' },
    {
      title: 'Ngày hẹn',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date: Date) => new Date(date).toLocaleDateString('vi-VN'),
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: CareServiceStatus) => {
        const colors: Record<CareServiceStatus, string> = {
            [CareServiceStatus.PENDING]: 'orange',
            [CareServiceStatus.CONFIRMED]: 'blue',
            [CareServiceStatus.ASSIGNED]: 'cyan',
            [CareServiceStatus.IN_PROGRESS]: 'purple',
            [CareServiceStatus.COMPLETED]: 'green',
            [CareServiceStatus.CANCELLED]: 'red',
            [CareServiceStatus.APPROVED]: '',
            [CareServiceStatus.REJECTED]: ''
        };
        const labels: Record<CareServiceStatus, string> = {
          [CareServiceStatus.PENDING]: 'Chờ xác nhận',
          [CareServiceStatus.CONFIRMED]: 'Đã xác nhận',
          [CareServiceStatus.ASSIGNED]: 'Đã phân công',
          [CareServiceStatus.IN_PROGRESS]: 'Đang làm',
          [CareServiceStatus.COMPLETED]: 'Hoàn thành',
          [CareServiceStatus.CANCELLED]: 'Đã hủy',
          [CareServiceStatus.APPROVED]: '',
          [CareServiceStatus.REJECTED]: ''
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
      width: 120,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_: any, record: CareServiceRequest) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            Chi tiết
          </Button>
          {record.status === CareServiceStatus.PENDING && (
            <>
              <Button type="primary" size="small" onClick={() => handleConfirm(record)}>
                Xác nhận
              </Button>
              <Button danger size="small" onClick={() => handleCancel(record.id)}>
                Hủy
              </Button>
            </>
          )}
          {record.status === CareServiceStatus.CONFIRMED && (
            <Button type="primary" size="small" onClick={() => handleAssign(record)}>
              Phân công
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const tabs = [
    {
      key: 'overview',
      label: '📊 Overview',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Requests" value={requests.length} prefix={<FileTextOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Pending" value={pendingRequests.length} prefix={<TeamOutlined />} valueStyle={{ color: '#faad14' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Confirmed" value={confirmedRequests.length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Active" value={activeRequests.length} prefix={<CalendarOutlined />} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col xs={24}>
            <Card title="💬 Customer Chat Support" extra={<Link href="/dashboard/support/chat"><Button type="primary" icon={<MessageOutlined />}>Manage Chats</Button></Link>}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="Waiting for Support" value={pendingChatRequests} valueStyle={{ color: '#faad14' }} />
                </Col>
                <Col span={8}>
                  <Statistic title="Active Chats" value={2} valueStyle={{ color: '#1890ff' }} />
                </Col>
                <Col span={8}>
                  <Statistic title="Resolved Today" value={5} valueStyle={{ color: '#52c41a' }} />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'pending',
      label: `⏳ Chờ xác nhận (${pendingRequests.length})`,
      children: <Card><Table columns={careRequestColumns} dataSource={pendingRequests} rowKey="id" pagination={{ pageSize: 10 }} /></Card>,
    },
    {
      key: 'confirmed',
      label: `✅ Đã xác nhận (${confirmedRequests.length})`,
      children: <Card><Table columns={careRequestColumns} dataSource={confirmedRequests} rowKey="id" pagination={{ pageSize: 10 }} /></Card>,
    },
    {
      key: 'active',
      label: `🔧 Đang thực hiện (${activeRequests.length})`,
      children: <Card><Table columns={careRequestColumns} dataSource={activeRequests} rowKey="id" pagination={{ pageSize: 10 }} /></Card>,
    },
    {
      key: 'all',
      label: `📋 All Requests (${requests.length})`,
      children: <Card><Table columns={careRequestColumns} dataSource={requests} rowKey="id" pagination={{ pageSize: 10 }} /></Card>,
    },
  ];

  return (
    <ProtectedRoute requiredRoles={[UserRole.SUPPORT_STAFF]}>
      <MainLayout title="Support Staff Dashboard">
        <Tabs items={tabs} />

        {/* Confirmation Modal */}
        <Modal
          title="📞 Xác nhận dịch vụ"
          open={confirmModalVisible}
          onCancel={() => setConfirmModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setConfirmModalVisible(false)}>
              Hủy
            </Button>,
            <Button key="confirm" type="primary" onClick={handleConfirmSubmit}>
              Xác nhận
            </Button>,
          ]}
        >
          {selectedRequest && (
            <div>
              <p><strong>Khách hàng:</strong> {selectedRequest.customerName}</p>
              <p><strong>Số điện thoại:</strong> {selectedRequest.customerPhone}</p>
              <p><strong>Địa chỉ:</strong> {selectedRequest.customerAddress}</p>
              <p><strong>Dịch vụ:</strong> {selectedRequest.packageName}</p>
              <p><strong>Ngày hẹn:</strong> {new Date(selectedRequest.scheduledDate).toLocaleString('vi-VN')}</p>
              <Alert 
                message="Vui lòng gọi điện xác nhận với khách hàng trước khi xác nhận yêu cầu" 
                type="info" 
                showIcon 
                className="mt-4"
              />
            </div>
          )}
        </Modal>

        {/* Assignment Modal */}
        <Modal
          title="👨‍🌾 Phân công nhân viên chăm sóc"
          open={assignModalVisible}
          onCancel={() => setAssignModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setAssignModalVisible(false)}>
              Hủy
            </Button>,
            <Button key="assign" type="primary" onClick={handleAssignSubmit} disabled={!selectedCaretaker}>
              Phân công
            </Button>,
          ]}
        >
          {selectedRequest && (
            <div>
              <p><strong>Dịch vụ:</strong> {selectedRequest.packageName}</p>
              <p><strong>Loại gói:</strong> {selectedRequest.packageType}</p>
              <p className="mt-4 mb-2"><strong>Chọn nhân viên:</strong></p>
              <Select
                style={{ width: '100%' }}
                placeholder="Chọn nhân viên chăm sóc"
                value={selectedCaretaker}
                onChange={setSelectedCaretaker}
              >
                {getAvailableCaretakers(selectedRequest.packageType).map(caretaker => (
                  <Select.Option key={caretaker.userId} value={caretaker.userId}>
                    {caretaker.name} - {caretaker.status === CaretakerStatus.AVAILABLE ? '✅ Rảnh rỗi' : '⏳ Bận'}
                    {caretaker.skills && ` (${caretaker.skills.join(', ')})`}
                  </Select.Option>
                ))}
              </Select>
              <Alert 
                message="Nhân viên được chọn sẽ trở thành người chịu trách nhiệm chính (Main Caretaker) cho dịch vụ này" 
                type="warning" 
                showIcon 
                className="mt-4"
              />
            </div>
          )}
        </Modal>

        {/* Cancel Modal */}
        <Modal
          title="❌ Hủy yêu cầu dịch vụ"
          open={cancelModalVisible}
          onCancel={() => setCancelModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setCancelModalVisible(false)}>
              Quay lại
            </Button>,
            <Button key="cancel" type="primary" danger onClick={handleCancelRequest}>
              Hủy yêu cầu
            </Button>,
          ]}
        >
          {selectedRequest && (
            <div>
              <p><strong>Khách hàng:</strong> {selectedRequest.customerName}</p>
              <p><strong>Dịch vụ:</strong> {selectedRequest.packageName}</p>
              <p className="mt-4 mb-2"><strong>Lý do hủy:</strong></p>
              <Input.TextArea
                rows={4}
                placeholder="Nhập lý do hủy..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <Alert 
                message="Hành động này không thể hoàn tác" 
                type="error" 
                showIcon 
                className="mt-4"
              />
            </div>
          )}
        </Modal>
      </MainLayout>
    </ProtectedRoute>
  );
}
