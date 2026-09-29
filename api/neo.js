export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const now = new Date();
  const end = new Date(Date.now() + 60 * 864e5);
  const d = x => x.toISOString().slice(0, 10);
  const url = `https://ssd-api.jpl.nasa.gov/cad.api?date-min=${d(now)}&date-max=${d(end)}&dist-max=.05&body=Earth&sort=date&diameter=true&fullname=true&limit=4`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'NEO-Planetary-Defense/1.0' } });
    if (!r.ok) throw new Error('JPL error');
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'JPL feed unavailable' });
  }
}
