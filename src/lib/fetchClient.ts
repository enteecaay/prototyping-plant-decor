/**
 * Custom fetch client that automatically includes ngrok-skip-browser-warning header
 * This prevents the ngrok warning page from showing in browsers
 */

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function fetchWithNgrokBypass(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  // Merge headers with ngrok-skip-browser-warning
  const headers = new Headers(fetchOptions.headers || {});
  headers.set('ngrok-skip-browser-warning', 'any-value');
  headers.set('User-Agent', 'PlantDecor-Client/1.0');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Global fetch override for all requests
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const [resource, config] = args;
    const headers = new Headers(config?.headers || {});
    headers.set('ngrok-skip-browser-warning', 'true');
    headers.set('User-Agent', 'PlantDecor-Client/1.0');

    return originalFetch.call(window, resource, {
      ...config,
      headers,
    });
  } as typeof fetch;
}

// Set custom User-Agent for ngrok bypass
if (typeof window !== 'undefined') {
  Object.defineProperty(navigator, 'userAgent', {
    get: () => 'PlantDecor-Client/1.0',
    configurable: true,
  });
}
