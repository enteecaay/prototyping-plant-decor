# Token Monitoring with Zustand Subscribe

This implementation provides real-time token tracking and automatic refresh using Zustand's `subscribeWithSelector` middleware.

## Features

✅ **Automatic Token Refresh** - Refreshes token 5 minutes before expiration
✅ **Real-time Monitoring** - Tracks token validity every minute
✅ **Persist Storage** - Automatically saves to localStorage
✅ **Token Subscribers** - React to token changes in real-time
✅ **Type-Safe** - Full TypeScript support

## Configuration

### Token Settings
- **Token Expiry**: 1 hour (3600000ms)
- **Refresh Threshold**: 5 minutes before expiry
- **Check Interval**: Every 60 seconds

## Usage

### 1. Automatic Initialization (Already Done)
The `TokenMonitoringInitializer` component is added to the root layout and starts monitoring automatically.

### 2. Display Token Status in UI

```tsx
import TokenMonitor from '@/components/TokenMonitor';

export default function YourPage() {
  return (
    <div>
      <TokenMonitor /> {/* Shows token expiration countdown */}
      {/* Your content */}
    </div>
  );
}
```

### 3. Use Token Monitoring Hook

```tsx
import { useTokenMonitoring } from '@/hooks/useTokenMonitoring';

export default function YourComponent() {
  const { timeRemaining, formattedTime, isExpired } = useTokenMonitoring();

  return (
    <div>
      <p>Time remaining: {formattedTime}</p>
      {isExpired && <Alert type="error">Session expired!</Alert>}
    </div>
  );
}
```

### 4. Check Token Status

```tsx
import { useTokenStatus } from '@/hooks/useTokenMonitoring';

export default function StatusComponent() {
  const { status, isExpired, formattedTime } = useTokenStatus();

  return (
    <Badge 
      status={status === 'valid' ? 'success' : status === 'expiring' ? 'warning' : 'error'}
      text={formattedTime}
    />
  );
}
```

### 5. Manual Token Refresh

```tsx
import { useAuthStore } from '@/store/auth';

export default function RefreshButton() {
  const refreshToken = useAuthStore((state) => state.refreshToken);

  const handleRefresh = async () => {
    await refreshToken();
    message.success('Token refreshed!');
  };

  return <Button onClick={handleRefresh}>Refresh Token</Button>;
}
```

### 6. Subscribe to Token Changes

```tsx
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export default function TokenSubscriber() {
  useEffect(() => {
    // Subscribe to token changes
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.token,
      (token, previousToken) => {
        console.log('Token changed:', { token, previousToken });
        // Do something when token changes
      }
    );

    return unsubscribe;
  }, []);

  return null;
}
```

## How It Works

### 1. Subscribe with Selector
```typescript
useAuthStore.subscribe(
  (state) => state.token,  // Selector - what to watch
  (token, previousToken) => {  // Callback - what to do
    console.log('Token changed!');
  }
);
```

### 2. Automatic Monitoring
- Checks token every **60 seconds**
- Refreshes automatically **5 minutes** before expiry
- Logs out user when token expires

### 3. Persist Middleware
- Saves auth state to localStorage as `auth-storage`
- Automatically restores on page reload
- Only persists necessary fields (user, token, timestamps)

### 4. Token Lifecycle

```
Login → Token Created (1h expiry)
  ↓
Every 1min → Check token validity
  ↓
55min mark → Auto-refresh triggered
  ↓
New Token → Subscribers notified
  ↓
60min+ → Token expired → Auto logout
```

## Advanced Usage

### Custom Token Subscriber

```tsx
import { useTokenStore } from '@/store/auth';

export default function CustomSubscriber() {
  useEffect(() => {
    const unsubscribe = useTokenStore.getState().addSubscriber((token) => {
      if (!token) {
        // Redirect to login
        window.location.href = '/login';
      }
    });

    return unsubscribe;
  }, []);

  return null;
}
```

### Get Time Remaining

```tsx
import { getTokenTimeRemaining, formatTokenTimeRemaining } from '@/store/auth';

const remaining = getTokenTimeRemaining(); // milliseconds
const formatted = formatTokenTimeRemaining(); // "45m 23s"
```

## Console Logs

The system logs important events:
- ✅ `Token refreshed at: [timestamp]`
- 🔄 `Token changed: { hasToken: true, timestamp }`
- ⚠️ `Token about to expire, refreshing...`
- ❌ `Token expired, logging out`
- 📢 `Authentication status changed: true/false`

## Testing

### Test Token Expiration (Development)
Change token expiry time in `auth.ts`:
```typescript
const TOKEN_EXPIRY_TIME = 2 * 60 * 1000; // 2 minutes for testing
```

Then login and watch the console for auto-refresh at 1:55.

## Benefits

1. **User Experience**: No sudden logouts - automatic refresh
2. **Security**: Tokens expire regularly (1 hour)
3. **Real-time**: UI updates immediately when token changes
4. **Scalable**: Subscribe pattern allows multiple components to react
5. **Type-Safe**: Full TypeScript support with proper types

## Migration from Old Code

Old code manually managed localStorage:
```typescript
// ❌ Old way
localStorage.setItem('auth_token', token);
```

New code uses persist middleware:
```typescript
// ✅ New way - automatic
persist(
  (set, get) => ({ /* store */ }),
  { name: 'auth-storage' }
)
```

All existing code continues to work - just better! 🎉
