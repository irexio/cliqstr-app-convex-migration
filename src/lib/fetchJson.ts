export async function fetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: 'include', // 🛟 This is the key
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');

  if (!res.ok) {
    const error = isJson ? await res.json() : await res.text();
    throw new Error(typeof error === 'string' ? error : error?.error || 'Unknown error');
  }

  return isJson ? res.json() : Promise.reject(new Error('Expected JSON response'));
}
