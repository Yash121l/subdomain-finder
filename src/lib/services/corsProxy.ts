/**
 * CORS proxy utilities for browser-based OSINT requests
 */

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

let currentProxyIndex = 0;

/**
 * Make a CORS-proxied request with automatic fallback
 */
export async function corsRequest<T>(
  url: string,
  options: {
    timeout?: number;
    parseJson?: boolean;
  } = {}
): Promise<T> {
  const { timeout = 10000, parseJson = true } = options;
  
  // First, try direct request (some APIs allow CORS)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return parseJson ? response.json() : response.text() as T;
    }
  } catch {
    // Direct request failed, try proxies
  }
  
  // Try CORS proxies
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxyIndex = (currentProxyIndex + i) % CORS_PROXIES.length;
    const proxyUrl = CORS_PROXIES[proxyIndex] + encodeURIComponent(url);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(proxyUrl, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        currentProxyIndex = proxyIndex;
        return parseJson ? response.json() : response.text() as T;
      }
    } catch {
      continue;
    }
  }
  
  throw new Error(`Failed to fetch ${url} through all proxies`);
}

/**
 * Make a direct fetch request (for APIs that support CORS)
 */
export async function directRequest<T>(
  url: string,
  options: {
    timeout?: number;
    parseJson?: boolean;
  } = {}
): Promise<T> {
  const { timeout = 10000, parseJson = true } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return parseJson ? response.json() : response.text() as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
