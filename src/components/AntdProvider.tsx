'use client';

import React from 'react';
import { ConfigProvider, App } from 'antd';

interface AntdProviderProps {
  children: React.ReactNode;
}

const AntdProvider: React.FC<AntdProviderProps> = ({ children }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#52c41a',
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
};

export default AntdProvider;
