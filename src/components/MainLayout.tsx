'use client';

import React, { ReactNode } from 'react';
import { Layout, Menu, Dropdown, Button, Badge, Avatar, Drawer } from 'antd';
import {
  MenuOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  AppstoreOutlined,
  UserOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { UserRole } from '@/types';
import ChatBox from '@/components/ChatBox';

const { Header, Content, Footer } = Layout;

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const cartItems = useCartStore((state) => state.getItemCount());
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      [UserRole.GUEST]: 'Guest',
      [UserRole.CUSTOMER]: 'Customer',
      [UserRole.ADMIN]: 'Admin',
      [UserRole.SUPPORT_STAFF]: 'Support Staff',
      [UserRole.SHIPPER]: 'Shipper',
      [UserRole.CARETAKER]: 'Caretaker',
    };
    return labels[role] || role;
  };

  const getMenuItems = () => {
    const commonItems = [
      {
        key: '1',
        icon: <HomeOutlined />,
        label: <Link href="/">Home</Link>,
      },
      {
        key: '2',
        icon: <AppstoreOutlined />,
        label: <Link href="/catalog">Catalog</Link>,
      },
    ];

    if (!isAuthenticated) {
      return commonItems;
    }

    const roleBasedItems = {
      [UserRole.GUEST]: commonItems,
      [UserRole.CUSTOMER]: [
        ...commonItems,
        {
          key: '3',
          icon: <DashboardOutlined />,
          label: <Link href="/dashboard/customer">Dashboard</Link>,
        },
        {
          key: '4',
          icon: <UserOutlined />,
          label: <Link href="/dashboard/customer/profile">Profile</Link>,
        },
      ],
      [UserRole.ADMIN]: [
        ...commonItems,
        {
          key: '5',
          icon: <DashboardOutlined />,
          label: <Link href="/dashboard/admin">Admin Dashboard</Link>,
        },
      ],
      [UserRole.SUPPORT_STAFF]: [
        ...commonItems,
        {
          key: '6',
          icon: <DashboardOutlined />,
          label: <Link href="/dashboard/support">Support Dashboard</Link>,
        },
      ],
      [UserRole.SHIPPER]: [
        ...commonItems,
        {
          key: '7',
          icon: <DashboardOutlined />,
          label: <Link href="/dashboard/shipper">Shipper Dashboard</Link>,
        },
      ],
      [UserRole.CARETAKER]: [
        ...commonItems,
        {
          key: '8',
          icon: <DashboardOutlined />,
          label: <Link href="/dashboard/caretaker">Caretaker Dashboard</Link>,
        },
      ],
    };

    return roleBasedItems[user?.role as UserRole || UserRole.GUEST] || commonItems;
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href="/dashboard/customer/profile">Profile</Link>,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            🌿 Plant Decor
          </Link>
        </div>

        {/* Desktop Menu */}
        <Menu
          mode="horizontal"
          items={getMenuItems()}
          style={{ flex: 1, marginLeft: '40px', border: 'none' }}
        />

        {/* Mobile Menu Button - hidden on desktop */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerOpen(true)}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {isAuthenticated && user?.role === UserRole.CUSTOMER && (
            <Link href="/cart">
              <Badge count={cartItems} showZero>
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined />}
                  size="large"
                />
              </Badge>
            </Link>
          )}

          {isAuthenticated && user ? (
            <Dropdown menu={{ items: userMenuItems }}>
              <Avatar
                icon={<UserOutlined />}
                style={{ cursor: 'pointer', backgroundColor: '#87d068' }}
                alt={`${user.name} (${getRoleLabel(user.role)})`}
              />
            </Dropdown>
          ) : (
            <Link href="/auth/login">
              <Button type="primary">Login</Button>
            </Link>
          )}
        </div>
      </Header>

      {/* Mobile Drawer Menu */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        <Menu
          items={getMenuItems()}
          onClick={() => setDrawerOpen(false)}
          style={{ border: 'none' }}
        />
      </Drawer>

      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {title && <h1 style={{ marginBottom: '24px' }}>{title}</h1>}
        {children}
      </Content>

      <Footer style={{ textAlign: 'center', color: '#666' }}>
        Plant Decor © 2025 | All Rights Reserved
      </Footer>

      {/* Floating Chat Box for Customers */}
      {user?.role === UserRole.CUSTOMER && <ChatBox />}
    </Layout>
  );
};

export default MainLayout;
