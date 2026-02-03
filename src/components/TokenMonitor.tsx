'use client';

import { useEffect } from 'react';
import { Alert, Button, Space, Typography } from 'antd';
import { ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { useTokenMonitoring, useTokenStatus } from '@/hooks/useTokenMonitoring';

const { Text } = Typography;

/**
 * Token Monitor Component
 * Displays token expiration status and allows manual refresh
 */
export default function TokenMonitor() {
  const { formattedTime, isExpired } = useTokenMonitoring();
  const { status } = useTokenStatus();
  const { refreshToken, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return null;

  const handleRefresh = async () => {
    await refreshToken();
  };

  const getAlertType = () => {
    if (isExpired) return 'error';
    if (status === 'expiring') return 'warning';
    return 'info';
  };

  const getMessage = () => {
    if (isExpired) return 'Session expired';
    if (status === 'expiring') return 'Session expiring soon';
    return 'Session active';
  };

  return (
    <Alert
      type={getAlertType()}
      message={
        <Space>
          <ClockCircleOutlined />
          <Text strong>{getMessage()}</Text>
          <Text>Time remaining: {formattedTime}</Text>
        </Space>
      }
      action={
        <Button
          size="small"
          type="text"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      }
      showIcon
      closable={false}
      style={{ marginBottom: 16 }}
    />
  );
}
