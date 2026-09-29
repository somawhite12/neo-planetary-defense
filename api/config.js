const DEFAULTS = {
  contractAddress: 'TBA',
  buyUrl: '',
  recipient: 'To be announced',
  defensePercent: 80,
  operationsPercent: 20,
  goal: 100000,
  contributions: []
};

const headers = () => ({
  Authorization: `Bearer ${process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''}`,
  'Content-Type': 'application/json'
});

const redisUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';

async function command(parts) {
  const url = redisUrl();
  if (!url || !(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)) {
    throw new Error('Redis is not configured');
  }
  const r = await fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(parts) });
  if (!r.ok) throw new Error('Redis request failed');
  const data = await r.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      const raw = await command(['GET', 'neo:site-config']);
      return res.status(200).json(raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS);
    } catch (e) {
      // Keep the public site usable before storage is connected.
      return res.status(200).json(DEFAULTS);
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = process.env.ADMIN_KEY || '';
  const supplied = String(req.headers['x-admin-key'] || '');
  if (!admin) return res.status(503).json({ error: 'ADMIN_KEY is not configured' });
  if (!supplied || supplied !== admin) return res.status(401).json({ error: 'Invalid admin key' });

  try {
    const input = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const defensePercent = Math.max(0, Math.min(100, Number(input.defensePercent) || 0));
    const value = {
      ...DEFAULTS,
      ...input,
      defensePercent,
      operationsPercent: 100 - defensePercent,
      goal: Math.max(1, Number(input.goal) || DEFAULTS.goal),
      contributions: Array.isArray(input.contributions) ? input.contributions : []
    };
    await command(['SET', 'neo:site-config', JSON.stringify(value)]);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(503).json({ error: 'Persistent storage is not configured or unavailable' });
  }
}
