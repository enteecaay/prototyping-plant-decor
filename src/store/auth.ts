import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { User, UserRole, AuthState } from '@/types';
import { MOCK_USERS } from '@/mock-data';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  refreshToken: () => Promise<void>;
  isTokenExpired: () => boolean;
  getUser: () => User | null;
  checkTokenValidity: () => void;
}

// Mock token generation - in production, this would come from backend
const generateMockToken = (): string => {
  return `tk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Token expires in 1 hour (more realistic for production)
const TOKEN_EXPIRY_TIME = 60 * 60 * 1000; // 1 hour
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh 5 min before expiry

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        lastTokenRefresh: 0,

        login: async (email: string, password: string) => {
          // Mock login - find user by email and password
          const mockUser = Object.values(MOCK_USERS).find(
            (user) => user.email === email && user.password === password
          );

          if (!mockUser) {
            throw new Error('Invalid email or password');
          }

          const token = generateMockToken();
          const now = Date.now();

          set({
            user: mockUser,
            token,
            isAuthenticated: true,
            lastTokenRefresh: now,
          });
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            lastTokenRefresh: 0,
          });
        },

        setUser: (user) => {
          set({ user, isAuthenticated: !!user });
        },

        setToken: (token) => {
          const now = Date.now();
          set({ token, lastTokenRefresh: now });
        },

        refreshToken: async () => {
          const { user, isTokenExpired } = get();

          if (!user) {
            console.warn('Cannot refresh token: no user logged in');
            return;
          }

          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 100));

          const newToken = generateMockToken();
          const now = Date.now();

          set({
            token: newToken,
            lastTokenRefresh: now,
          });

          console.log('Token refreshed at:', new Date(now).toLocaleString());
        },

        isTokenExpired: () => {
          const { token, lastTokenRefresh } = get();

          if (!token) return true;

          const now = Date.now();
          const tokenAge = now - lastTokenRefresh;

          return tokenAge > TOKEN_EXPIRY_TIME;
        },

        checkTokenValidity: () => {
          const { token, lastTokenRefresh, refreshToken, logout } = get();

          if (!token) return;

          const now = Date.now();
          const tokenAge = now - lastTokenRefresh;

          // Token expired - logout
          if (tokenAge > TOKEN_EXPIRY_TIME) {
            console.warn('Token expired, logging out');
            logout();
            return;
          }

          // Token about to expire - refresh
          if (tokenAge > TOKEN_EXPIRY_TIME - TOKEN_REFRESH_THRESHOLD) {
            console.log('Token about to expire, refreshing...');
            refreshToken();
          }
        },

        getUser: () => get().user,
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
          lastTokenRefresh: state.lastTokenRefresh,
        }),
      }
    )
  )
);

// Real-time token monitoring with Zustand subscribe
let tokenCheckInterval: NodeJS.Timeout | null = null;

export const startTokenMonitoring = (): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {}; // Return empty cleanup function for SSR
  }

  // Clear existing interval
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
  }

  // Check token every minute
  tokenCheckInterval = setInterval(() => {
    const state = useAuthStore.getState();
    if (state.isAuthenticated) {
      state.checkTokenValidity();
    }
  }, 60 * 1000); // Check every minute

  // Subscribe to token changes for real-time tracking
  const unsubscribe = useAuthStore.subscribe(
    (state) => state.token,
    (token, previousToken) => {
      if (token !== previousToken) {
        console.log('Token changed:', {
          hasToken: !!token,
          timestamp: new Date().toLocaleString(),
        });

        // Update token store if it exists
        if (useTokenStore.getState) {
          const state = useAuthStore.getState();
          useTokenStore.setState({
            token,
            expiresAt: token ? state.lastTokenRefresh + TOKEN_EXPIRY_TIME : null,
          });
          useTokenStore.getState().notifySubscribers();
        }
      }
    }
  );

  // Subscribe to authentication state changes
  const authUnsubscribe = useAuthStore.subscribe(
    (state) => state.isAuthenticated,
    (isAuthenticated) => {
      console.log('Authentication status changed:', isAuthenticated);
      
      if (!isAuthenticated && tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
        tokenCheckInterval = null;
      }
    }
  );

  // Initial token check
  const state = useAuthStore.getState();
  if (state.isAuthenticated) {
    state.checkTokenValidity();
  }

  return () => {
    unsubscribe();
    authUnsubscribe();
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval);
      tokenCheckInterval = null;
    }
  };
};

export const stopTokenMonitoring = () => {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
    tokenCheckInterval = null;
  }
};
// Token tracking store with subscribers (for advanced use cases)
interface TokenState {
  token: string | null;
  expiresAt: number | null;
  isRefreshing: boolean;
  subscribers: Set<(token: string | null) => void>;
  addSubscriber: (callback: (token: string | null) => void) => () => void;
  removeSubscriber: (callback: (token: string | null) => void) => void;
  notifySubscribers: () => void;
  updateToken: (token: string | null, expiresAt?: number) => void;
}

export const useTokenStore = create<TokenState>((set, get) => ({
  token: null,
  expiresAt: null,
  isRefreshing: false,
  subscribers: new Set(),

  addSubscriber: (callback) => {
    const { subscribers } = get();
    subscribers.add(callback);

    // Notify immediately with current token
    callback(get().token);

    // Return unsubscribe function
    return () => {
      subscribers.delete(callback);
    };
  },

  removeSubscriber: (callback) => {
    const { subscribers } = get();
    subscribers.delete(callback);
  },

  notifySubscribers: () => {
    const { subscribers, token } = get();
    subscribers.forEach((callback) => {
      callback(token);
    });
  },

  updateToken: (token, expiresAt) => {
    const newExpiresAt =
      expiresAt || (token ? Date.now() + TOKEN_EXPIRY_TIME : null);

    set({
      token,
      expiresAt: newExpiresAt,
    });

    // Notify all subscribers of token change
    get().notifySubscribers();
  },
}));

// Helper: Get time until token expires
export const getTokenTimeRemaining = (): number => {
  const state = useAuthStore.getState();
  if (!state.token || !state.lastTokenRefresh) return 0;

  const expiresAt = state.lastTokenRefresh + TOKEN_EXPIRY_TIME;
  const now = Date.now();
  const remaining = expiresAt - now;

  return remaining > 0 ? remaining : 0;
};

// Helper: Format time remaining
export const formatTokenTimeRemaining = (): string => {
  const remaining = getTokenTimeRemaining();
  
  if (remaining === 0) return 'Expired';

  const minutes = Math.floor(remaining / (60 * 1000));
  const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};
