// Optional KV-backed user cache. No-op if env is missing.

type U = any;

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;

async function kvGet(key: string) {
  if (!kvUrl || !kvToken) return null;
  const r = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${kvToken}` },
    cache: 'no-store',
  });
  if (!r.ok) return null;
  const { result } = await r.json();
  return result ?? null;
}

async function kvSet(key: string, val: any, ttlSeconds: number) {
  if (!kvUrl || !kvToken) return;
  await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${kvToken}`,
    },
    body: JSON.stringify({ value: val, expiration: ttlSeconds }),
  });
}

export async function getCachedUser(userId: string): Promise<U | null> {
  const raw = await kvGet(`user:${userId}`);
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== 'object' || !('id' in parsed)) return null;
    return parsed as U;
  } catch {
    return null;
  }
}

export async function setCachedUser(userId: string, user: U, ttl = 60) {
  try {
    await kvSet(`user:${userId}`, JSON.stringify(user), ttl);
  } catch {
    await kvSet(`user:${userId}`, user, ttl);
  }
}

export async function invalidateUser(userId: string) {
  if (!kvUrl || !kvToken) return;
  await fetch(`${kvUrl}/del/${encodeURIComponent(`user:${userId}`)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kvToken}` },
  });
}


