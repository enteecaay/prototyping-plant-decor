'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Tag,
  Button,
  Modal,
  Input,
  Avatar,
  Space,
  Badge,
  List,
  Empty,
  Typography,
  message,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  MessageOutlined,
  UserOutlined,
  RobotOutlined,
  CustomerServiceOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { useChatStore, ChatSession, ChatMessage } from '@/store/chat';
import { UserRole } from '@/types';

const { TextArea } = Input;
const { Text } = Typography;

export default function SupportChatPage() {
  const { user } = useAuthStore();
  const {
    sessions,
    getWaitingSessions,
    getActiveSessions,
    getClosedSessions,
    joinSession,
    closeSession,
    addMessage,
  } = useChatStore();

  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'waiting' | 'active' | 'closed'>('waiting');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const waitingSessions = getWaitingSessions();
  const activeSessions = getActiveSessions();
  const closedSessions = getClosedSessions();

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = useChatStore.subscribe((state) => {
      if (selectedSession) {
        const updated = state.sessions.find((s) => s.id === selectedSession.id);
        if (updated) {
          setSelectedSession(updated);
        }
      }
    });
    return unsubscribe;
  }, [selectedSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedSession?.messages]);

  const handleJoinChat = (session: ChatSession) => {
    joinSession(session.id, user?.id || '', user?.name || 'Support Staff');
    setSelectedSession(useChatStore.getState().sessions.find((s) => s.id === session.id) || null);
    setActiveTab('active');
    message.success('You have joined the chat!');
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedSession) return;

    addMessage(selectedSession.id, {
      sender: 'support',
      senderName: user?.name || 'Support Staff',
      message: inputMessage,
    });

    setInputMessage('');
  };

  const handleCloseChat = (session: ChatSession) => {
    Modal.confirm({
      title: 'Close Chat Session',
      content: 'Are you sure you want to close this chat session?',
      onOk: () => {
        closeSession(session.id);
        setSelectedSession(null);
        message.success('Chat session closed');
      },
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const renderMessage = (msg: ChatMessage) => {
    const isSupport = msg.sender === 'support';
    const isCustomer = msg.sender === 'customer';
    const isAI = msg.sender === 'ai';

    return (
      <div
        key={msg.id}
        style={{
          display: 'flex',
          justifyContent: isSupport ? 'flex-end' : 'flex-start',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isSupport ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            maxWidth: '75%',
          }}
        >
          <Avatar
            size="small"
            style={{
              backgroundColor: isCustomer ? '#1890ff' : isAI ? '#52c41a' : '#722ed1',
              margin: isSupport ? '0 0 0 8px' : '0 8px 0 0',
              flexShrink: 0,
            }}
            icon={
              isCustomer ? <SmileOutlined /> : isAI ? <RobotOutlined /> : <CustomerServiceOutlined />
            }
          />
          <div
            style={{
              background: isSupport ? '#722ed1' : isCustomer ? '#e6f7ff' : '#f6ffed',
              color: isSupport ? 'white' : 'black',
              padding: '8px 12px',
              borderRadius: '12px',
              borderTopRightRadius: isSupport ? '0' : '12px',
              borderTopLeftRadius: isSupport ? '12px' : '0',
              border: isSupport ? 'none' : isCustomer ? '1px solid #91d5ff' : '1px solid #b7eb8f',
            }}
          >
            <Text strong style={{ fontSize: '11px', display: 'block', marginBottom: '2px', color: isSupport ? 'rgba(255,255,255,0.8)' : isAI ? '#52c41a' : '#1890ff' }}>
              {msg.senderName}
            </Text>
            <div style={{ fontSize: '13px' }}>{msg.message}</div>
            <Text style={{ fontSize: '10px', color: isSupport ? 'rgba(255,255,255,0.6)' : '#999' }}>
              {formatTime(msg.timestamp)}
            </Text>
          </div>
        </div>
      </div>
    );
  };

  const renderSessionList = (sessionList: ChatSession[], type: 'waiting' | 'active' | 'closed') => {
    if (sessionList.length === 0) {
      return <Empty description={`No ${type} chats`} />;
    }

    return (
      <List
        dataSource={sessionList}
        renderItem={(session) => (
          <List.Item
            style={{
              padding: '12px',
              cursor: 'pointer',
              background: selectedSession?.id === session.id ? '#f0f5ff' : 'white',
              borderRadius: '8px',
              marginBottom: '8px',
              border: selectedSession?.id === session.id ? '1px solid #1890ff' : '1px solid #f0f0f0',
            }}
            onClick={() => setSelectedSession(session)}
          >
            <List.Item.Meta
              avatar={
                <Badge dot={type === 'waiting'} color="orange">
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                </Badge>
              }
              title={
                <Space>
                  <span>{session.customerName}</span>
                  {type === 'waiting' && <Tag color="orange">Waiting</Tag>}
                  {type === 'active' && <Tag color="green">Active</Tag>}
                  {type === 'closed' && <Tag color="default">Closed</Tag>}
                </Space>
              }
              description={
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {session.messages[session.messages.length - 1]?.message.substring(0, 50)}...
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    <ClockCircleOutlined /> {formatTimeAgo(session.requestedHumanAt || session.createdAt)}
                  </Text>
                </div>
              }
            />
            {type === 'waiting' && (
              <Button
                type="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinChat(session);
                }}
              >
                Join Chat
              </Button>
            )}
          </List.Item>
        )}
      />
    );
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.SUPPORT_STAFF]}>
      <MainLayout title="Chat Management">
        {/* Stats */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Waiting"
                value={waitingSessions.length}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Active"
                value={activeSessions.length}
                prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Closed Today"
                value={closedSessions.length}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Session List */}
          <Col xs={24} md={8}>
            <Card
              title={
                <Space>
                  <MessageOutlined />
                  <span>Chat Sessions</span>
                </Space>
              }
              extra={
                <Button
                  icon={<ReloadOutlined />}
                  size="small"
                  onClick={() => setSelectedSession(null)}
                >
                  Refresh
                </Button>
              }
              style={{ height: 'calc(100vh - 320px)', overflowY: 'auto' }}
              styles={{ body: { padding: '12px' } }}
            >
              {/* Tab buttons */}
              <Space style={{ marginBottom: '12px', width: '100%' }}>
                <Button
                  type={activeTab === 'waiting' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setActiveTab('waiting')}
                >
                  <Badge count={waitingSessions.length} size="small" offset={[8, 0]}>
                    Waiting
                  </Badge>
                </Button>
                <Button
                  type={activeTab === 'active' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setActiveTab('active')}
                >
                  <Badge count={activeSessions.length} size="small" offset={[8, 0]}>
                    Active
                  </Badge>
                </Button>
                <Button
                  type={activeTab === 'closed' ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setActiveTab('closed')}
                >
                  Closed
                </Button>
              </Space>

              {activeTab === 'waiting' && renderSessionList(waitingSessions, 'waiting')}
              {activeTab === 'active' && renderSessionList(activeSessions, 'active')}
              {activeTab === 'closed' && renderSessionList(closedSessions, 'closed')}
            </Card>
          </Col>

          {/* Chat Window */}
          <Col xs={24} md={16}>
            <Card
              title={
                selectedSession ? (
                  <Space>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                    <div>
                      <div>{selectedSession.customerName}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {selectedSession.customerEmail}
                      </Text>
                    </div>
                    {selectedSession.status === 'active' && (
                      <Tag color="green">You are chatting</Tag>
                    )}
                  </Space>
                ) : (
                  <span>Select a chat session</span>
                )
              }
              extra={
                selectedSession?.status === 'active' && (
                  <Button
                    danger
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleCloseChat(selectedSession)}
                  >
                    Close Chat
                  </Button>
                )
              }
              style={{ height: 'calc(100vh - 320px)', display: 'flex', flexDirection: 'column' }}
              styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: '0' } }}
            >
              {selectedSession ? (
                <>
                  {/* Messages */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '16px',
                      background: '#fafafa',
                      minHeight: '300px',
                      maxHeight: 'calc(100vh - 500px)',
                    }}
                  >
                    {selectedSession.messages.map(renderMessage)}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input - only for active sessions where this staff is assigned */}
                  {selectedSession.status === 'active' && selectedSession.supportStaffId === user?.id && (
                    <div style={{ padding: '12px', borderTop: '1px solid #f0f0f0' }}>
                      <Space.Compact style={{ width: '100%' }}>
                        <TextArea
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Type your message..."
                          autoSize={{ minRows: 1, maxRows: 3 }}
                          onPressEnter={(e) => {
                            if (!e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={handleSendMessage}
                          style={{ height: 'auto' }}
                        >
                          Send
                        </Button>
                      </Space.Compact>
                    </div>
                  )}

                  {/* Join button for waiting sessions */}
                  {selectedSession.status === 'waiting' && (
                    <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
                      <Button
                        type="primary"
                        size="large"
                        icon={<CustomerServiceOutlined />}
                        onClick={() => handleJoinChat(selectedSession)}
                      >
                        Join This Chat
                      </Button>
                    </div>
                  )}

                  {/* Closed message */}
                  {selectedSession.status === 'closed' && (
                    <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0', textAlign: 'center', background: '#fafafa' }}>
                      <Text type="secondary">This chat session has been closed</Text>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Empty description="Select a chat from the list to view messages" />
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </MainLayout>
    </ProtectedRoute>
  );
}
