'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Card,
  Input,
  Avatar,
  Space,
  Tag,
  Typography,
  Badge,
  message,
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  RobotOutlined,
  CustomerServiceOutlined,
  SmileOutlined,
  PhoneOutlined,
  CloseOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { useChatStore, ChatMessage, ChatSession } from '@/store/chat';

const { TextArea } = Input;
const { Text } = Typography;

const AI_RESPONSES = [
  "I'd be happy to help you with that! For plant care, make sure to check the watering schedule and light requirements specific to your plant type.",
  "Great question! Our care packages include regular watering, pruning, pest control, and health monitoring. Would you like more details?",
  "Based on your plant's symptoms, it might need more indirect sunlight. Try moving it near a window with filtered light.",
  "I recommend our Premium Care Package for multiple plants. It includes weekly visits and comprehensive care.",
  "For new plant parents, I suggest starting with hardy plants like Snake Plant or Pothos. They're very forgiving!",
  "Our delivery typically takes 2-3 business days. You can track your order in the 'My Orders' section.",
  "Yes, we offer plant replacement if your plant arrives damaged. Please contact support within 48 hours with photos.",
];

export default function ChatBox() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    getOrCreateSession,
    getSessionByCustomerId,
    addMessage,
    requestHumanSupport,
  } = useChatStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or get existing session when opened
  useEffect(() => {
    if (isOpen && user && isAuthenticated) {
      const existingSession = getSessionByCustomerId(user.id);
      if (existingSession) {
        setSession(existingSession);
      } else {
        const newSession = getOrCreateSession(user.id, user.name, user.email);
        setSession(newSession);
      }
      setUnreadCount(0);
    }
  }, [isOpen, user, isAuthenticated, getOrCreateSession, getSessionByCustomerId]);

  // Subscribe to session updates
  useEffect(() => {
    const unsubscribe = useChatStore.subscribe((state) => {
      if (user) {
        const updated = state.sessions.find(
          (s) => s.customerId === user.id && s.status !== 'closed'
        );
        if (updated) {
          // Check for new messages
          if (session && updated.messages.length > session.messages.length) {
            const newMessages = updated.messages.slice(session.messages.length);
            const hasNewFromOthers = newMessages.some(m => m.sender !== 'customer');
            if (hasNewFromOthers && !isOpen) {
              setUnreadCount(prev => prev + newMessages.filter(m => m.sender !== 'customer').length);
            }
          }
          setSession(updated);
        }
      }
    });
    return unsubscribe;
  }, [user, session, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [session?.messages, isOpen]);

  const handleSend = () => {
    if (!inputMessage.trim() || !session) return;

    addMessage(session.id, {
      sender: 'customer',
      senderName: user?.name || 'Customer',
      message: inputMessage,
    });

    setInputMessage('');

    // If no support staff has joined, AI responds
    if (session.status === 'ai-only' || session.status === 'waiting') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage(session.id, {
          sender: 'ai',
          senderName: 'AI Assistant',
          message: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
        });
      }, 1000 + Math.random() * 1000);
    }
  };

  const handleRequestHumanSupport = () => {
    if (!session || session.status !== 'ai-only') return;

    addMessage(session.id, {
      sender: 'customer',
      senderName: user?.name || 'Customer',
      message: '🙋 I would like to speak with a human support staff member.',
    });

    requestHumanSupport(session.id);
    message.info('Support request sent! A staff member will join soon.');
  };

  const handleOpen = () => {
    if (!isAuthenticated) {
      message.warning('Please login to use chat support');
      return;
    }
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const renderMessage = (msg: ChatMessage) => {
    const isCustomer = msg.sender === 'customer';
    const isAI = msg.sender === 'ai';

    return (
      <div
        key={msg.id}
        style={{
          display: 'flex',
          justifyContent: isCustomer ? 'flex-end' : 'flex-start',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isCustomer ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            maxWidth: '85%',
          }}
        >
          <Avatar
            size="small"
            style={{
              backgroundColor: isCustomer ? '#1890ff' : isAI ? '#52c41a' : '#722ed1',
              margin: isCustomer ? '0 0 0 6px' : '0 6px 0 0',
              flexShrink: 0,
            }}
            icon={
              isCustomer ? (
                <SmileOutlined />
              ) : isAI ? (
                <RobotOutlined />
              ) : (
                <CustomerServiceOutlined />
              )
            }
          />
          <div
            style={{
              background: isCustomer ? '#1890ff' : isAI ? '#f6ffed' : '#f9f0ff',
              color: isCustomer ? 'white' : 'black',
              padding: '6px 10px',
              borderRadius: '10px',
              borderTopRightRadius: isCustomer ? '0' : '10px',
              borderTopLeftRadius: isCustomer ? '10px' : '0',
              border: isCustomer ? 'none' : isAI ? '1px solid #b7eb8f' : '1px solid #d3adf7',
              fontSize: '13px',
            }}
          >
            {!isCustomer && (
              <Text strong style={{ fontSize: '11px', display: 'block', marginBottom: '2px', color: isAI ? '#52c41a' : '#722ed1' }}>
                {msg.senderName}
              </Text>
            )}
            <div>{msg.message}</div>
            <Text
              style={{
                fontSize: '9px',
                color: isCustomer ? 'rgba(255,255,255,0.7)' : '#999',
              }}
            >
              {new Date(msg.timestamp).toLocaleTimeString()}
            </Text>
          </div>
        </div>
      </div>
    );
  };

  const quickReplies = [
    '🌱 Plant care tips',
    '📦 Track order',
    '🏥 Plant is sick',
  ];

  // Don't render for non-customers or guests viewing public pages
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
          }}
        >
          <Badge count={unreadCount} offset={[-5, 5]}>
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<MessageOutlined />}
              onClick={handleOpen}
              style={{
                width: '56px',
                height: '56px',
                fontSize: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                border: 'none',
              }}
            />
          </Badge>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '360px',
            height: '500px',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: 'white',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'white',
            }}
          >
            <Space>
              <Avatar
                size="small"
                icon={session?.status === 'active' ? <CustomerServiceOutlined /> : <RobotOutlined />}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>
                  {session?.status === 'active' ? session.supportStaffName : 'Plant Care Assistant'}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                  {session?.status === 'waiting' ? '⏳ Waiting for staff...' : 
                   session?.status === 'active' ? '🟢 Staff connected' : 
                   '🤖 AI Assistant'}
                </div>
              </div>
            </Space>
            <Space>
              <Button
                type="text"
                size="small"
                icon={<MinusOutlined />}
                onClick={() => setIsMinimized(true)}
                style={{ color: 'white' }}
              />
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => setIsOpen(false)}
                style={{ color: 'white' }}
              />
            </Space>
          </div>

          {/* Status Banner */}
          {session?.status === 'waiting' && (
            <div style={{ 
              background: '#fff7e6', 
              padding: '8px 12px', 
              fontSize: '12px',
              borderBottom: '1px solid #ffd591',
              color: '#d46b08'
            }}>
              🔔 Support staff will join shortly...
            </div>
          )}
          {session?.status === 'active' && (
            <div style={{ 
              background: '#f6ffed', 
              padding: '8px 12px', 
              fontSize: '12px',
              borderBottom: '1px solid #b7eb8f',
              color: '#389e0d'
            }}>
              ✅ {session.supportStaffName} is here to help!
            </div>
          )}

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px',
              background: '#fafafa',
            }}
          >
            {session?.messages.map(renderMessage)}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '12px' }}>
                <Avatar size="small" style={{ backgroundColor: '#52c41a' }} icon={<RobotOutlined />} />
                <span>AI is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {session?.status === 'ai-only' && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0', background: 'white' }}>
              <Space size={[4, 4]} wrap>
                {quickReplies.map((reply) => (
                  <Tag
                    key={reply}
                    style={{ cursor: 'pointer', fontSize: '11px', margin: 0 }}
                    onClick={() => setInputMessage(reply)}
                  >
                    {reply}
                  </Tag>
                ))}
                <Tag
                  color="purple"
                  style={{ cursor: 'pointer', fontSize: '11px', margin: 0 }}
                  onClick={handleRequestHumanSupport}
                >
                  <PhoneOutlined /> Talk to Human
                </Tag>
              </Space>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px', borderTop: '1px solid #f0f0f0', background: 'white' }}>
            <Space.Compact style={{ width: '100%' }}>
              <TextArea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={session?.status === 'closed' ? 'Chat ended' : 'Type a message...'}
                disabled={session?.status === 'closed'}
                autoSize={{ minRows: 1, maxRows: 3 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                style={{ fontSize: '13px' }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={session?.status === 'closed'}
                style={{ 
                  height: 'auto',
                  background: '#52c41a',
                  borderColor: '#52c41a',
                }}
              />
            </Space.Compact>
          </div>
        </div>
      )}

      {/* Minimized Chat */}
      {isOpen && isMinimized && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
          }}
        >
          <Badge count={unreadCount} offset={[-5, 5]}>
            <Button
              type="primary"
              size="large"
              icon={<MessageOutlined />}
              onClick={() => setIsMinimized(false)}
              style={{
                height: '48px',
                paddingLeft: '16px',
                paddingRight: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Chat</span>
              <CloseOutlined 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                style={{ marginLeft: '8px' }}
              />
            </Button>
          </Badge>
        </div>
      )}
    </>
  );
}
