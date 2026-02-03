import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'ai' | 'support';
  senderName: string;
  message: string;
  timestamp: string; // ISO string for serialization
}

export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: 'ai-only' | 'waiting' | 'active' | 'closed';
  createdAt: string;
  requestedHumanAt?: string;
  supportJoinedAt?: string;
  supportStaffId?: string;
  supportStaffName?: string;
  messages: ChatMessage[];
}

interface ChatStore {
  sessions: ChatSession[];
  
  // Customer actions
  getOrCreateSession: (customerId: string, customerName: string, customerEmail: string) => ChatSession;
  addMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  requestHumanSupport: (sessionId: string) => void;
  
  // Support actions
  joinSession: (sessionId: string, supportStaffId: string, supportStaffName: string) => void;
  closeSession: (sessionId: string) => void;
  
  // Getters
  getSessionById: (sessionId: string) => ChatSession | undefined;
  getSessionByCustomerId: (customerId: string) => ChatSession | undefined;
  getWaitingSessions: () => ChatSession[];
  getActiveSessions: () => ChatSession[];
  getClosedSessions: () => ChatSession[];
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],

      getOrCreateSession: (customerId, customerName, customerEmail) => {
        const existing = get().sessions.find(
          (s) => s.customerId === customerId && s.status !== 'closed'
        );
        
        if (existing) return existing;

        const newSession: ChatSession = {
          id: `chat-${Date.now()}`,
          customerId,
          customerName,
          customerEmail,
          status: 'ai-only',
          createdAt: new Date().toISOString(),
          messages: [
            {
              id: `msg-${Date.now()}`,
              sender: 'ai',
              senderName: 'AI Assistant',
              message: "Hello! 🌱 I'm your Plant Care AI Assistant. How can I help you today?",
              timestamp: new Date().toISOString(),
            },
          ],
        };

        set((state) => ({
          sessions: [...state.sessions, newSession],
        }));

        return newSession;
      },

      addMessage: (sessionId, messageData) => {
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...messageData,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, newMessage] }
              : s
          ),
        }));
      },

      requestHumanSupport: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  status: 'waiting' as const,
                  requestedHumanAt: new Date().toISOString(),
                }
              : s
          ),
        }));

        // Add system message
        get().addMessage(sessionId, {
          sender: 'ai',
          senderName: 'AI Assistant',
          message: "I've notified our support team. A staff member will join this conversation shortly. Please wait... 🔔",
        });
      },

      joinSession: (sessionId, supportStaffId, supportStaffName) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  status: 'active' as const,
                  supportJoinedAt: new Date().toISOString(),
                  supportStaffId,
                  supportStaffName,
                }
              : s
          ),
        }));

        // Add join message
        get().addMessage(sessionId, {
          sender: 'support',
          senderName: supportStaffName,
          message: `👋 Hi! I'm ${supportStaffName} from Support Team. I've reviewed your conversation. How can I help you today?`,
        });
      },

      closeSession: (sessionId) => {
        get().addMessage(sessionId, {
          sender: 'support',
          senderName: 'System',
          message: '✅ This chat session has been closed. Thank you for contacting Plant Decor Support!',
        });

        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, status: 'closed' as const }
              : s
          ),
        }));
      },

      getSessionById: (sessionId) => {
        return get().sessions.find((s) => s.id === sessionId);
      },

      getSessionByCustomerId: (customerId) => {
        return get().sessions.find(
          (s) => s.customerId === customerId && s.status !== 'closed'
        );
      },

      getWaitingSessions: () => {
        return get().sessions.filter((s) => s.status === 'waiting');
      },

      getActiveSessions: () => {
        return get().sessions.filter((s) => s.status === 'active');
      },

      getClosedSessions: () => {
        return get().sessions.filter((s) => s.status === 'closed');
      },
    }),
    {
      name: 'plant-decor-chat',
    }
  )
);
