'use client';

import { useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, Upload, Select, Timeline, Alert, Row, Col, Statistic, Tabs, Space, message } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  PlusOutlined,
  UserSwitchOutlined,
  RollbackOutlined,
  CameraOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useCareServiceStore } from '@/store/careService';
import { useAuthStore } from '@/store/auth';
import { CareServiceStatus, CaretakerStatus, ServicePackageType } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import type { CareServiceRequest, ServiceProgressLog, AddOnService } from '@/types';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserRole } from '@/types';

export default function CaretakerDashboard() {
  const { user } = useAuthStore();
  const {
    requests,
    checkIn,
    addProgressLog,
    suggestAddOn,
    handoverToCaretaker,
    reclaimTask,
    completeService,
    caretakers,
  } = useCareServiceStore();

  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [addOnModalVisible, setAddOnModalVisible] = useState(false);
  const [handoverModalVisible, setHandoverModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CareServiceRequest | null>(null);
  const [selectedCaretaker, setSelectedCaretaker] = useState<string>('');
  const [form] = Form.useForm();
  const [progressForm] = Form.useForm();
  const [addOnForm] = Form.useForm();

  // Get tasks assigned to current user
  const myTasks = requests.filter(
    (r) =>
      (r.mainCaretakerId === user?.id || r.currentCaretakerId === user?.id) &&
      [CareServiceStatus.ASSIGNED, CareServiceStatus.IN_PROGRESS].includes(r.status)
  );

  const pendingTasks = myTasks.filter((r) => r.status === CareServiceStatus.ASSIGNED);
  const activeTasks = myTasks.filter((r) => r.status === CareServiceStatus.IN_PROGRESS);

  // Check if current user is helping someone (handed over to them)
  const isHelping = (request: CareServiceRequest) => {
    return request.currentCaretakerId === user?.id && request.mainCaretakerId !== user?.id;
  };

  // Check if task is handed over to someone else
  const isHandedOver = (request: CareServiceRequest) => {
    return request.mainCaretakerId === user?.id && request.currentCaretakerId !== user?.id;
  };

  const handleCheckIn = () => {
    if (!selectedRequest || !user?.id || !user?.name) return;
    checkIn(selectedRequest.id, user.id, user.name);
    message.success('Đã check-in thành công!');
    setCheckInModalVisible(false);
    setSelectedRequest(null);
  };

  const handleAddProgress = (values: any) => {
    if (!selectedRequest || !user?.id || !user?.name) return;
    const log = {
      serviceRequestId: selectedRequest.id,
      caretakerId: user.id,
      caretakerName: user.name,
      action: values.action,
      description: values.notes,
      photos: values.photoUrl ? [values.photoUrl] : undefined,
    };
    addProgressLog(selectedRequest.id, log);
    message.success('Đã ghi nhận tiến độ!');
    progressForm.resetFields();
    setProgressModalVisible(false);
    setSelectedRequest(null);
  };

  const handleSuggestAddOn = (values: any) => {
    if (!selectedRequest || !user?.id) return;
    const addOn = {
      serviceRequestId: selectedRequest.id,
      name: values.name,
      description: values.description,
      price: values.estimatedPrice,
      suggestedBy: user.id,
    };
    suggestAddOn(selectedRequest.id, addOn);
    message.success('Đã gửi đề xuất dịch vụ bổ sung!');
    addOnForm.resetFields();
    setAddOnModalVisible(false);
    setSelectedRequest(null);
  };

  const handleHandover = () => {
    if (!selectedRequest || !selectedCaretaker) return;
    const caretaker = caretakers.find((c) => c.userId === selectedCaretaker);
    if (!caretaker) return;
    handoverToCaretaker(selectedRequest.id, selectedCaretaker, caretaker.name);
    message.success(`Đã bàn giao công việc cho ${caretaker.name}!`);
    setHandoverModalVisible(false);
    setSelectedRequest(null);
    setSelectedCaretaker('');
  };

  const handleReclaim = () => {
    if (!selectedRequest || !user?.id) return;
    reclaimTask(selectedRequest.id, user.id);
    message.success('Đã thu hồi quyền thực hiện công việc!');
    setSelectedRequest(null);
  };

  const handleComplete = () => {
    if (!selectedRequest) return;
    completeService(selectedRequest.id);
    message.success('Đã hoàn thành dịch vụ! Đang vào thời gian buffer 30 phút.');
    setCompleteModalVisible(false);
    setSelectedRequest(null);
  };

  const columns: ColumnsType<CareServiceRequest> = [
    {
      title: 'Mã dịch vụ',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `CS-${id.slice(0, 8)}`,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'packageName',
      key: 'packageName',
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        let color = 'default';
        let icon = null;
        let text = status;

        if (status === CareServiceStatus.ASSIGNED) {
          color = 'orange';
          icon = <ClockCircleOutlined />;
          text = 'Chưa bắt đầu';
        } else if (status === CareServiceStatus.IN_PROGRESS) {
          color = 'blue';
          icon = <ClockCircleOutlined />;
          text = 'Đang thực hiện';
        }

        // Check handover status
        if (isHelping(record)) {
          return (
            <Space direction="vertical" size="small">
              <Tag color={color} icon={icon}>{text}</Tag>
              <Tag color="purple" icon={<UserSwitchOutlined />}>Hỗ trợ {record.mainCaretakerName}</Tag>
            </Space>
          );
        }

        if (isHandedOver(record)) {
          return (
            <Space direction="vertical" size="small">
              <Tag color={color} icon={icon}>{text}</Tag>
              <Tag color="cyan" icon={<UserSwitchOutlined />}>Đã ủy quyền cho {record.currentCaretakerName}</Tag>
            </Space>
          );
        }

        return <Tag color={color} icon={icon}>{text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => {
        const isCurrentlyResponsible = record.currentCaretakerId === user?.id;
        const isMainCaretaker = record.mainCaretakerId === user?.id;
        const canWork = isCurrentlyResponsible && !isHandedOver(record);

        return (
          <Space wrap>
            {/* Check-in button */}
            {record.status === CareServiceStatus.ASSIGNED && canWork && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setSelectedRequest(record);
                  setCheckInModalVisible(true);
                }}
              >
                Check-in
              </Button>
            )}

            {/* Add progress button */}
            {record.status === CareServiceStatus.IN_PROGRESS && canWork && (
              <>
                <Button
                  icon={<CameraOutlined />}
                  onClick={() => {
                    setSelectedRequest(record);
                    setProgressModalVisible(true);
                  }}
                >
                  Ghi nhận tiến độ
                </Button>

                <Button
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedRequest(record);
                    setAddOnModalVisible(true);
                  }}
                >
                  Đề xuất dịch vụ
                </Button>

                {isMainCaretaker && (
                  <Button
                    icon={<UserSwitchOutlined />}
                    onClick={() => {
                      setSelectedRequest(record);
                      setHandoverModalVisible(true);
                    }}
                  >
                    Bàn giao
                  </Button>
                )}

                {isMainCaretaker && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      setSelectedRequest(record);
                      setCompleteModalVisible(true);
                    }}
                  >
                    Hoàn thành
                  </Button>
                )}
              </>
            )}

            {/* Reclaim button for handed over tasks */}
            {isMainCaretaker && isHandedOver(record) && (
              <Button
                type="primary"
                danger
                icon={<RollbackOutlined />}
                onClick={() => {
                  setSelectedRequest(record);
                  Modal.confirm({
                    title: 'Thu hồi quyền thực hiện',
                    content: `Bạn có chắc muốn thu hồi công việc từ ${record.currentCaretakerName}?`,
                    onOk: handleReclaim,
                  });
                }}
              >
                Thu hồi quyền
              </Button>
            )}

            {/* View-only mode when helping */}
            {isHelping(record) && (
              <Tag color="purple">Chế độ hỗ trợ - Chỉ xem</Tag>
            )}
          </Space>
        );
      },
    },
  ];

  const tabs = [
    {
      key: 'overview',
      label: '📊 Tổng quan',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Công việc chờ làm"
                value={pendingTasks.length}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Đang thực hiện"
                value={activeTasks.length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Tổng công việc"
                value={myTasks.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'pending',
      label: `⏳ Chờ làm (${pendingTasks.length})`,
      children: (
        <Card>
          <Table columns={columns} dataSource={pendingTasks} rowKey="id" pagination={{ pageSize: 10 }} />
        </Card>
      ),
    },
    {
      key: 'active',
      label: `🔧 Đang làm (${activeTasks.length})`,
      children: (
        <Card>
          <Table columns={columns} dataSource={activeTasks} rowKey="id" pagination={{ pageSize: 10 }} />
        </Card>
      ),
    },
    {
      key: 'all',
      label: `📋 Tất cả (${myTasks.length})`,
      children: (
        <Card>
          <Table columns={columns} dataSource={myTasks} rowKey="id" pagination={{ pageSize: 10 }} />
        </Card>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRoles={[UserRole.CARETAKER]}>
      <MainLayout title="Caretaker Dashboard">
        <Tabs items={tabs} />

        {/* Check-in Modal */}
        <Modal
          title="✅ Check-in công việc"
          open={checkInModalVisible}
          onCancel={() => {
            setCheckInModalVisible(false);
            setSelectedRequest(null);
          }}
          footer={[
            <Button key="cancel" onClick={() => setCheckInModalVisible(false)}>
              Hủy
            </Button>,
            <Button key="checkin" type="primary" onClick={handleCheckIn}>
              Check-in
            </Button>,
          ]}
        >
          {selectedRequest && (
            <div>
              <p><strong>Khách hàng:</strong> {selectedRequest.customerName}</p>
              <p><strong>Dịch vụ:</strong> {selectedRequest.packageName}</p>
              <p><strong>Địa chỉ:</strong> {selectedRequest.customerAddress}</p>
              <p><strong>Ngày hẹn:</strong> {new Date(selectedRequest.scheduledDate).toLocaleString('vi-VN')}</p>
              <Alert
                message="Bạn sẵn sàng bắt đầu công việc?"
                type="info"
                showIcon
                className="mt-4"
              />
            </div>
          )}
        </Modal>

        {/* Progress Modal */}
        <Modal
          title="📸 Ghi nhận tiến độ"
          open={progressModalVisible}
          onCancel={() => {
            setProgressModalVisible(false);
            setSelectedRequest(null);
            progressForm.resetFields();
          }}
          footer={[
            <Button key="cancel" onClick={() => setProgressModalVisible(false)}>
              Hủy
            </Button>,
            <Button key="submit" type="primary" onClick={() => progressForm.submit()}>
              Lưu tiến độ
            </Button>,
          ]}
        >
          <Form form={progressForm} layout="vertical" onFinish={handleAddProgress}>
            <Form.Item
              label="Hành động"
              name="action"
              rules={[{ required: true, message: 'Vui lòng nhập hành động' }]}
            >
              <Input placeholder="VD: Tưới nước, cắt tỉa, bón phân..." />
            </Form.Item>
            <Form.Item
              label="Ghi chú"
              name="notes"
              rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
            >
              <Input.TextArea rows={3} placeholder="Mô tả chi tiết công việc đã thực hiện..." />
            </Form.Item>
            <Form.Item label="Hình ảnh (URL)" name="photoUrl">
              <Input placeholder="https://example.com/image.jpg" />
            </Form.Item>
          </Form>

          {selectedRequest && selectedRequest.progressLogs && selectedRequest.progressLogs.length > 0 && (
            <>
              <h4 className="mt-4 mb-2">Lịch sử tiến độ:</h4>
              <Timeline
                items={selectedRequest.progressLogs.map((log) => ({
                  children: (
                    <div>
                      <p><strong>{log.action}</strong> - {log.caretakerName}</p>
                      <p className="text-gray-500">{log.description}</p>
                      <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString('vi-VN')}</p>
                    </div>
                  ),
                }))}
              />
            </>
          )}
        </Modal>

        {/* Add-on Service Modal */}
        <Modal
          title="➕ Đề xuất dịch vụ bổ sung"
          open={addOnModalVisible}
          onCancel={() => {
            setAddOnModalVisible(false);
            setSelectedRequest(null);
            addOnForm.resetFields();
          }}
          footer={[
            <Button key="cancel" onClick={() => setAddOnModalVisible(false)}>
              Hủy
            </Button>,
            <Button key="submit" type="primary" onClick={() => addOnForm.submit()}>
              Gửi đề xuất
            </Button>,
          ]}
        >
          <Form form={addOnForm} layout="vertical" onFinish={handleSuggestAddOn}>
            <Form.Item
              label="Tên dịch vụ"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}
            >
              <Input placeholder="VD: Thay đất mới, phun thuốc trừ sâu..." />
            </Form.Item>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            >
              <Input.TextArea rows={3} placeholder="Mô tả chi tiết dịch vụ và lý do cần thiết..." />
            </Form.Item>
            <Form.Item
              label="Giá ước tính (VND)"
              name="estimatedPrice"
              rules={[{ required: true, message: 'Vui lòng nhập giá ước tính' }]}
            >
              <Input type="number" placeholder="100000" />
            </Form.Item>
            <Form.Item
              label="Thời gian ước tính (phút)"
              name="estimatedDuration"
              rules={[{ required: true, message: 'Vui lòng nhập thời gian ước tính' }]}
            >
              <Input type="number" placeholder="30" />
            </Form.Item>
          </Form>
          <Alert
            message="Dịch vụ bổ sung cần được khách hàng chấp thuận trước khi thực hiện"
            type="warning"
            showIcon
          />
        </Modal>

        {/* Handover Modal */}
        <Modal
          title="👥 Bàn giao công việc"
          open={handoverModalVisible}
          onCancel={() => {
            setHandoverModalVisible(false);
            setSelectedRequest(null);
            setSelectedCaretaker('');
          }}
          footer={[
            <Button key="cancel" onClick={() => setHandoverModalVisible(false)}>
              Hủy
            </Button>,
            <Button key="handover" type="primary" onClick={handleHandover} disabled={!selectedCaretaker}>
              Bàn giao
            </Button>,
          ]}
        >
          {selectedRequest && (
            <div>
              <p><strong>Dịch vụ:</strong> {selectedRequest.packageName}</p>
              <p className="mt-4 mb-2"><strong>Chọn đồng nghiệp:</strong></p>
              <Select
                style={{ width: '100%' }}
                placeholder="Chọn nhân viên nhận bàn giao"
                value={selectedCaretaker}
                onChange={setSelectedCaretaker}
              >
                {caretakers
                  .filter((c) => c.userId !== user?.id && c.status === CaretakerStatus.AVAILABLE)
                  .map((caretaker) => (
                    <Select.Option key={caretaker.userId} value={caretaker.userId}>
                      {caretaker.name} - {caretaker.skills?.join(', ')}
                    </Select.Option>
                  ))}
              </Select>
              <Alert
                message="Sau khi bàn giao, đồng nghiệp sẽ tiếp tục thực hiện công việc. Bạn vẫn là người chịu trách nhiệm chính và có thể thu hồi quyền bất cứ lúc nào."
                type="info"
                showIcon
                className="mt-4"
              />
            </div>
          )}
        </Modal>

        {/* Complete Modal */}
        <Modal
          title="✅ Hoàn thành dịch vụ"
          open={completeModalVisible}
          onCancel={() => {
            setCompleteModalVisible(false);
            setSelectedRequest(null);
          }}
          footer={[
            <Button key="cancel" onClick={() => setCompleteModalVisible(false)}>
              Hủy
            </Button>,
            <Button key="complete" type="primary" onClick={handleComplete}>
              Hoàn thành
            </Button>,
          ]}
        >
          {selectedRequest && (
            <div>
              <p><strong>Khách hàng:</strong> {selectedRequest.customerName}</p>
              <p><strong>Dịch vụ:</strong> {selectedRequest.packageName}</p>
              <Alert
                message="Sau khi hoàn thành, hệ thống sẽ vào thời gian buffer 30 phút. Trong thời gian này, bạn vẫn có thể cập nhật thông tin nếu cần."
                type="success"
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
