// Vercel function: forwards the app's Are.na requests with the token added here, so it never
// reaches the browser. Set ARENA_TOKEN in the Vercel project's environment variables.
// vercel.json routes /arena/* here, matching the dev server's proxy in vite.config.js.
export default async function handler(req, res) {
  const path = [req.query.path ?? []].flat().join('/');
  // Only the two calls the app makes (channel size, then its contents), so the token can't be
  // borrowed for anything else
  if (!/^v2\/channels\/[\w-]+(\/contents)?$/.test(path)) return res.status(404).end();
  const url = new URL(`https://api.are.na/${path}`);
  for (const key of ['per', 'page']) if (req.query[key]) url.searchParams.set(key, req.query[key]);

  const upstream = await fetch(url, {
    headers: process.env.ARENA_TOKEN ? { Authorization: `Bearer ${process.env.ARENA_TOKEN}` } : {},
  });
  res.status(upstream.status).setHeader('Content-Type', 'application/json').send(await upstream.text());
}
