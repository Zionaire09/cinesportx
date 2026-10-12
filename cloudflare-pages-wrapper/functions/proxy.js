const ALLOWED_HOSTS = new Set([
  'vsembed.ru',
  'vidsrc.mov',
  'vidlink.pro',
  'www.vidsrc.wtf',
  'peachify.pro',
  'vidfast.pro',
  'vidcore.net',
  'embed.smashystream.com',
  'vidup.to',
  '111movies.com',
  'vidsrcme.ru',
  'player.vidzee.wtf',
  'player.videasy.net',
  'vidnest.fun',
  'vidrock.ru',
  'www.2embed.cc',
  'multiembed.mov',
  'primesrc.me',
  'vidlux.xyz',
  'embed.streamxtv.tech',
]);

const isAllowedUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

const proxyUrl = (requestUrl, targetUrl) => {
  return `${new URL('/proxy', requestUrl).href}?url=${encodeURIComponent(targetUrl)}`;
};

const injectedScript = (targetUrl, requestUrl) => {
  const target = JSON.stringify(targetUrl);
  const proxy = JSON.stringify(new URL('/proxy', requestUrl).origin + '/proxy');
  return `<script data-rabbitv3-popup-guard>
(() => {
  'use strict';
  const UPSTREAM = ${target};
  const UPSTREAM_ORIGIN = new URL(UPSTREAM).origin;
  const PROXY_ENDPOINT = ${proxy};
  const toAbsolute = (value) => {
    try { return new URL(String(value), document.baseURI); } catch { return null; }
  };
  const toProxy = (value) => {
    const url = toAbsolute(value);
    if (!url || url.protocol !== 'https:' || url.origin !== UPSTREAM_ORIGIN) return value;
    return PROXY_ENDPOINT + '?url=' + encodeURIComponent(url.href);
  };

  // Block ad/redirect windows without using iframe sandboxing.
  const blockedOpen = () => null;
  window.open = blockedOpen;
  globalThis.open = blockedOpen;

  // Keep same-origin provider API calls inside the proxy.
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === 'string' || input instanceof URL) input = toProxy(input);
    else if (input && input.url) input = new Request(toProxy(input.url), input);
    return nativeFetch(input, init);
  };

  const nativeXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    return nativeXhrOpen.call(this, method, toProxy(url), ...rest);
  };

  const rewriteFrame = (frame) => {
    if (!(frame instanceof HTMLIFrameElement)) return;
    const current = frame.getAttribute('src');
    if (current) {
      const rewritten = toProxy(current);
      if (rewritten !== current) frame.setAttribute('src', rewritten);
    }
  };
  const nativeSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (this instanceof HTMLIFrameElement && String(name).toLowerCase() === 'src') value = toProxy(value);
    return nativeSetAttribute.call(this, name, value);
  };
  const frameSrc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src');
  if (frameSrc?.set && frameSrc?.get) {
    Object.defineProperty(HTMLIFrameElement.prototype, 'src', {
      configurable: frameSrc.configurable,
      enumerable: frameSrc.enumerable,
      get: frameSrc.get,
      set(value) { frameSrc.set.call(this, toProxy(value)); }
    });
  }
  document.querySelectorAll('iframe').forEach(rewriteFrame);
  new MutationObserver((records) => {
    for (const record of records) for (const node of record.addedNodes) {
      if (node.nodeType !== 1) continue;
      if (node.matches?.('iframe')) rewriteFrame(node);
      node.querySelectorAll?.('iframe').forEach(rewriteFrame);
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[target="_blank"], a[target="_new"]');
    if (link) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
})();
</script>`;
};

const rewriteHtml = (html, targetUrl, requestUrl) => {
  const baseTag = `<base href="${targetUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">`;
  const guard = injectedScript(targetUrl, requestUrl);
  let result = html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}${guard}`);
  if (result === html) result = `${guard}${html}`;
  // Rewrite static iframe URLs before the provider's scripts run.
  result = result.replace(/(<iframe\b[^>]*\bsrc\s*=\s*["'])([^"']+)(["'])/gi, (all, prefix, value, suffix) => {
    try {
      const absolute = new URL(value, targetUrl).href;
      return isAllowedUrl(absolute) ? `${prefix}${proxyUrl(requestUrl, absolute)}${suffix}` : all;
    } catch {
      return all;
    }
  });
  return result;
};

export async function onRequest(context) {
  const rawTarget = new URL(context.request.url).searchParams.get('url');
  if (!rawTarget || !isAllowedUrl(rawTarget)) {
    return new Response('Unsupported or missing upstream URL', { status: 400 });
  }

  const targetUrl = new URL(rawTarget);
  const upstream = await fetch(targetUrl.href, {
    headers: {
      'User-Agent': context.request.headers.get('User-Agent') || 'Mozilla/5.0',
      'Accept': context.request.headers.get('Accept') || '*/*',
      'Accept-Language': context.request.headers.get('Accept-Language') || 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, br',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'iframe',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Referer': `${targetUrl.origin}/`,
    },
    redirect: 'follow',
  });

  const headers = new Headers(upstream.headers);
  headers.delete('content-security-policy');
  headers.delete('content-security-policy-report-only');
  headers.delete('x-frame-options');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');

  const contentType = headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return new Response(upstream.body, { status: upstream.status, headers });

  const html = await upstream.text();
  headers.set('content-type', 'text/html; charset=UTF-8');
  return new Response(rewriteHtml(html, targetUrl.href, context.request.url), { status: upstream.status, headers });
}
