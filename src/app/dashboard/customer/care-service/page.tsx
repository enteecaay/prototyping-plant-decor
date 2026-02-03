'use client';

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Result,
  Space,
  Divider,
  Typography,
  message,
  Alert,
  Tag,
} from 'antd';
import {
  CheckCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { useCareServiceStore } from '@/store/careService';
import { UserRole, CareServiceStatus, ServicePackageType } from '@/types';
import { MOCK_CARE_PACKAGES, MOCK_PLANT_INSTANCES } from '@/mock-data';

const { TextArea } = Input;
const { Text, Title } = Typography;

export default function CareServiceRegistrationPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const { user } = useAuthStore();
  const { createRequest } = useCareServiceStore();
  const router = useRouter();
  const isProfileIncomplete = !user?.phone || !user?.address;

  // Autofill user info
  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        customerName: user.name,
        customerPhone: user.phone,
        customerEmail: user.email,
        customerAddress: user.address,
      });
    }
  }, [user, form]);

  const userPlants = MOCK_PLANT_INSTANCES.filter((p) => p.customerId === user?.id);

  const handlePackageChange = (packageId: string) => {
    const pkg = MOCK_CARE_PACKAGES.find((p) => p.id === packageId);
    setSelectedPackage(pkg);
  };

  // Disable dates before 48 hours from now
  const disabledDate = (current: any) => {
    const minDate = dayjs().add(48, 'hours');
    return current && current < minDate;
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      const pkg = MOCK_CARE_PACKAGES.find((p) => p.id === values.packageId);
      const selectedPlants = userPlants.filter((p) => values.plantIds?.includes(p.id));

      const request = createRequest({
        customerId: user!.id,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail,
        customerAddress: values.customerAddress,
        workAddress: values.workAddress,
        packageId: values.packageId,
        packageName: pkg!.name,
        packageType: pkg!.type,
        plantIds: values.plantIds || [],
        plantNames: selectedPlants.map((p) => p.plantName),
        status: CareServiceStatus.PENDING,
        scheduledDate: values.scheduledDate.toDate(),
        basePrice: pkg!.price,
        addOnTotal: 0,
        totalPrice: pkg!.price,
        customerNotes: values.customerNotes,
      });

      setTimeout(() => {
        setServiceId(request.id);
        setSuccess(true);
        setLoading(false);
        message.success('Đăng ký dịch vụ thành công!');
      }, 1000);
    } catch (error) {
      setLoading(false);
      message.error('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  if (success) {
    return (
      <ProtectedRoute requiredRoles={[UserRole.CUSTOMER]}>
        <MainLayout title="Đăng ký Dịch vụ Chăm sóc Cây">
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Đăng ký dịch vụ thành công!"
            subTitle={
              <Space direction="vertical" size="small">
                <Text>Mã đơn dịch vụ: <Text strong>{serviceId}</Text></Text>
                <Text>
                  Chúng tôi sẽ liên hệ với bạn trong vòng <Text strong>24 giờ</Text> để xác nhận lịch hẹn.
                </Text>
                <Alert
                  message="Lưu ý"
                  description="Nhân viên hỗ trợ sẽ gọi điện xác nhận thông tin và thời gian cụ thể trước khi phân công chuyên viên chăm sóc."
                  type="info"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              </Space>
            }
            extra={[
              <Button type="primary" key="list" onClick={() => router.push('/dashboard/customer/care-services')}>
                Xem danh sách dịch vụ
              </Button>,
              <Button key="home" onClick={() => router.push('/dashboard/customer')}>
                Về trang chủ
              </Button>,
            ]}
          />
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={[UserRole.CUSTOMER]}>
      <MainLayout title="Đặt lịch Chăm sóc Cây">
        <Alert
          message="📅 Quy tắc đặt lịch"
          description="Để đảm bảo thời gian điều phối, bạn chỉ có thể đặt lịch hẹn cách thời điểm hiện tại tối thiểu 48-72 giờ."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Row gutter={24}>
          {/* Service Packages */}
          <Col xs={24} lg={8}>
            <Card title="📦 Các gói dịch vụ" style={{ marginBottom: '24px' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {MOCK_CARE_PACKAGES.map((pkg) => (
                  <Card
                    key={pkg.id}
                    hoverable
                    size="small"
                    style={{
                      border: selectedPackage?.id === pkg.id ? '2px solid #52c41a' : '1px solid #d9d9d9',
                      background: selectedPackage?.id === pkg.id ? '#f6ffed' : 'white',
                    }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong style={{ fontSize: '16px' }}>{pkg.name}</Text>
                        <Tag color={
                          pkg.type === ServicePackageType.PLANT_DOCTOR ? 'red' :
                          pkg.type === ServicePackageType.PLANT_SPA ? 'blue' : 'purple'
                        }>
                          {pkg.type === ServicePackageType.PLANT_DOCTOR ? '🏥 Bác sĩ' :
                           pkg.type === ServicePackageType.PLANT_SPA ? '💆 Spa' : '🎨 Tư vấn'}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>{pkg.description}</Text>
                      <Divider style={{ margin: '8px 0' }} />
                      <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '12px' }}>
                        {pkg.services.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                      <Divider style={{ margin: '8px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                          {pkg.price.toLocaleString('vi-VN')}đ
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          ⏱ {pkg.duration}h
                        </Text>
                      </div>
                    </Space>
                  </Card>
                ))}
              </Space>
            </Card>
          </Col>

          {/* Registration Form */}
          <Col xs={24} lg={16}>
            <Card title="📝 Thông tin đăng ký">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                initialValues={{
                  customerName: user?.name || '',
                  customerPhone: user?.phone || '',
                  customerEmail: user?.email || '',
                  customerAddress: user?.address || '',
                }}
              >
                <Title level={5} style={{ marginBottom: '16px' }}>
                  <EnvironmentOutlined /> Thông tin khách hàng (Auto-fill)
                </Title>

                {isProfileIncomplete && (
                  <Alert
                    message="Hồ sơ chưa đầy đủ"
                    description="Vui lòng nhập số điện thoại và địa chỉ để đăng ký dịch vụ."
                    type="warning"
                    showIcon
                    className="mb-4"
                  />
                )}
                
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Họ và tên"
                      name="customerName"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                      <Input prefix={<EnvironmentOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Số điện thoại"
                      name="customerPhone"
                      rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}
                    >
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Email"
                  name="customerEmail"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} />
                </Form.Item>

                <Form.Item
                  label="Địa chỉ nhà"
                  name="customerAddress"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                  <Input prefix={<EnvironmentOutlined />} />
                </Form.Item>

                <Form.Item
                  label="Địa chỉ làm việc (nếu khác địa chỉ nhà)"
                  name="workAddress"
                  tooltip="Để trống nếu trùng với địa chỉ nhà"
                >
                  <Input prefix={<EnvironmentOutlined />} placeholder="Tùy chọn" />
                </Form.Item>

                <Divider />

                <Title level={5} style={{ marginBottom: '16px' }}>
                  <CalendarOutlined /> Chi tiết dịch vụ
                </Title>

                <Form.Item
                  label="Chọn gói dịch vụ"
                  name="packageId"
                  rules={[{ required: true, message: 'Vui lòng chọn gói dịch vụ!' }]}
                >
                  <Select
                    placeholder="Chọn gói dịch vụ"
                    onChange={handlePackageChange}
                    options={MOCK_CARE_PACKAGES.map((pkg) => ({
                      value: pkg.id,
                      label: `${pkg.name} - ${pkg.price.toLocaleString('vi-VN')}đ`,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label="Ngày hẹn"
                  name="scheduledDate"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn!' }]}
                  tooltip="Chỉ được chọn ngày cách ít nhất 48 giờ từ bây giờ"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY HH:mm"
                    showTime={{ format: 'HH:mm' }}
                    disabledDate={disabledDate}
                    placeholder="Chọn ngày và giờ hẹn"
                  />
                </Form.Item>

                {userPlants.length > 0 && (
                  <Form.Item
                    label="Chọn cây cần chăm sóc (tùy chọn)"
                    name="plantIds"
                    tooltip="Để trống nếu tư vấn setup chung"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn cây"
                      options={userPlants.map((p) => ({
                        value: p.id,
                        label: `${p.plantName} - ${p.location}`,
                      }))}
                    />
                  </Form.Item>
                )}

                <Form.Item
                  label="Ghi chú đặc biệt"
                  name="customerNotes"
                >
                  <TextArea
                    rows={4}
                    placeholder="Vd: Cây có dấu hiệu vàng lá, cần kiểm tra kỹ..."
                  />
                </Form.Item>

                <Divider />

                {selectedPackage && (
                  <Card size="small" style={{ marginBottom: '16px', background: '#f6ffed' }}>
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong>Tổng chi phí:</Text>
                      </Col>
                      <Col>
                        <Text strong style={{ fontSize: '24px', color: '#52c41a' }}>
                          {selectedPackage.price.toLocaleString('vi-VN')}đ
                        </Text>
                      </Col>
                    </Row>
                  </Card>
                )}

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={loading} size="large">
                      Đăng ký dịch vụ
                    </Button>
                    <Button onClick={() => router.back()}>
                      Hủy
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </MainLayout>
    </ProtectedRoute>
  );
}
