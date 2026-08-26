interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

const ALLOWED_STREAM_HOSTS = new Set([
  'vidfast.pro',
  'vidfast.in',
  'vidfast.io',
  'vidfast.me',
  'vidfast.net',
  'vidfast.pm',
  'vidfast.xyz',
  'vidfast.vc',
  'vidlink.pro',
  'embed.smashystream.com',
  'vidup.to',
  '111movies.com',
  'vidsrcme.ru',
  'player.vidzee.wtf',
  'player.videasy.net',
  'vidnest.fun',
  'vidrock.ru',
  'vidscr.wtf',
  'www.vidsrc.wtf',
  'www.2embed.cc',
  'multiembed.mov',
  'primesrc.me',
]);

const UNAVAILABLE_RESPONSE_PATTERNS = [
  /\b404\b/i,
  /\bmovie\s+not\s+available\b/i,
  /\bvideo\s+not\s+available\b/i,
  /\bcontent\s+not\s+available\b/i,
  /\bmedia\s+not\s+available\b/i,
  /\bno\s+(?:stream|sources?)\b/i,
  /\bnot\s+found\b/i,
];

const MAX_REDIRECTS = 3;
const PROBE_TIMEOUT_MS = 8_000;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
});

const isAllowedStreamUrl = (url: URL) => url.protocol === 'https:' && ALLOWED_STREAM_HOSTS.has(url.hostname);

const responseIndicatesUnavailableContent = async (response: Response) => {
  if (response.status === 404 || response.status === 410) return true;
  if (!response.ok) return false;

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
    return false;
  }

  try {
    const responseText = (await response.text()).slice(0, 100_000);
    return UNAVAILABLE_RESPONSE_PATTERNS.some((pattern) => pattern.test(responseText));
  } catch {
    return false;
  }
};

const probeEmbed = async (initialUrl: URL) => {
  let url = initialUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        return { available: false, reason: 'The stream server returned an invalid redirect.' };
      }

      const redirectedUrl = new URL(location, url);
      if (!isAllowedStreamUrl(redirectedUrl)) {
        return { available: false, reason: 'The stream server redirected outside the approved provider list.' };
      }

      url = redirectedUrl;
      continue;
    }

    if (await responseIndicatesUnavailableContent(response)) {
      return { available: false, reason: `The stream server reported ${response.status || 'unavailable'} content.` };
    }

    return { available: true, reason: 'The stream server responded with playable embed content.' };
  }

  return { available: false, reason: 'The stream server redirected too many times.' };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestUrl = new URL(request.url);

    if (requestUrl.pathname !== '/api/stream-health') {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed.' }, 405);
    }

    let embedUrl: string;
    try {
      const body = await request.json<{ url?: string }>();
      embedUrl = body.url || '';
    } catch {
      return json({ error: 'Invalid request body.' }, 400);
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(embedUrl);
    } catch {
      return json({ error: 'Invalid stream URL.' }, 400);
    }

    if (!isAllowedStreamUrl(targetUrl)) {
      return json({ error: 'The stream URL is not an approved provider.' }, 400);
    }

    try {
      return json(await probeEmbed(targetUrl));
    } catch {
      return json({ available: false, reason: 'The stream server could not be reached.' });
    }
  },
};
