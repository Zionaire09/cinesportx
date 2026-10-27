const REPLAY_ORIGIN = 'https://livextv-backend.onrender.com';
const UPSTREAM_TIMEOUT_MS = 10_000;

interface WorkerEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

async function proxyReplayApi(request: Request) {
  const url = new URL(request.url);
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const upstreamPath = url.pathname.slice('/replay-api'.length) || '/';
  const upstreamUrl = `${REPLAY_ORIGIN}/api${upstreamPath}${url.search}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    const headers = new Headers(upstream.headers);
    headers.delete('set-cookie');
    headers.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('Cache-Control', 'public, max-age=60');
    headers.set('X-Replay-Source', 'livextv-backend.onrender.com');
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'The replay catalogue is unavailable.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/replay-api' || url.pathname.startsWith('/replay-api/')) {
      return proxyReplayApi(request);
    }
    return env.ASSETS.fetch(request);
  },
};
