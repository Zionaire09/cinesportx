(() => {
  'use strict';

  const errorBox = document.getElementById('error');
  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.style.display = 'flex';
  };

  const validators = [
    ['vsembed.ru', (u) => /^\/embed\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)\/?$/.test(u.pathname)],
    ['vidsrc.mov', (u) => /^\/embed\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)\/?$/.test(u.pathname)],
    ['vidlink.pro', (u) => /^\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)$/.test(u.pathname)],
    ['www.vidsrc.wtf', (u) => /^\/api\/1\/(?:movie|tv)$/.test(u.pathname) && /^\d+$/.test(u.searchParams.get('id') || '') && (u.pathname.endsWith('/movie') || (/^\d+$/.test(u.searchParams.get('s') || '') && /^\d+$/.test(u.searchParams.get('e') || '')))],
    ['peachify.pro', (u) => /^\/embed\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)$/.test(u.pathname)],
    ['vidfast.pro', (u) => /^\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)$/.test(u.pathname)],
    ['vidcore.net', (u) => /^\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)$/.test(u.pathname)],
    ['embed.smashystream.com', (u) => u.pathname === '/playere.php' && /^\d+$/.test(u.searchParams.get('tmdb') || '') && ((!u.searchParams.has('season') && !u.searchParams.has('episode')) || (/^\d+$/.test(u.searchParams.get('season') || '') && /^\d+$/.test(u.searchParams.get('episode') || '')))],
    ['vidup.to', (u) => /^\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)$/.test(u.pathname)],
    ['111movies.com', (u) => /^\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)$/.test(u.pathname)],
    ['vidsrcme.ru', (u) => /^\/embed\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)$/.test(u.pathname)],
    ['player.vidzee.wtf', (u) => /^\/embed\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)$/.test(u.pathname)],
    ['player.videasy.net', (u) => /^\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)$/.test(u.pathname)],
    ['vidnest.fun', (u) => /^\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)$/.test(u.pathname)],
    ['vidrock.ru', (u) => /^\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)$/.test(u.pathname)],
    ['www.2embed.cc', (u) => /^\/embed\/\d+$/.test(u.pathname) || /^\/embedtv\/\d+&s=\d+&e=\d+$/.test(u.pathname)],
    ['multiembed.mov', (u) => u.pathname === '/' && /^\d+$/.test(u.searchParams.get('video_id') || '') && u.searchParams.get('tmdb') === '1' && ((!u.searchParams.has('s') && !u.searchParams.has('e')) || (/^\d+$/.test(u.searchParams.get('s') || '') && /^\d+$/.test(u.searchParams.get('e') || '')))],
    ['primesrc.me', (u) => (u.pathname === '/embed/movie' && /^\d+$/.test(u.searchParams.get('tmdb') || '')) || (u.pathname === '/embed/tv' && /^\d+$/.test(u.searchParams.get('tmdb') || '') && /^\d+$/.test(u.searchParams.get('season') || '') && /^\d+$/.test(u.searchParams.get('episode') || ''))],
    ['vidlux.xyz', (u) => /^\/embed\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)$/.test(u.pathname)],
    ['embed.streamxtv.tech', (u) => /^\/embed\/\d+(?:\/\d+\/\d+)?$/.test(u.pathname)],
  ];

  const isAllowedProviderUrl = (url) =>
    url.protocol === 'https:' &&
    url.username === '' &&
    url.password === '' &&
    !url.port &&
    validators.some(([host, validate]) => url.hostname === host && validate(url));

  let playerUrl;
  try {
    const rawUrl = new URLSearchParams(window.location.search).get('url');
    if (!rawUrl) throw new Error('missing URL');
    playerUrl = new URL(rawUrl);
    if (!isAllowedProviderUrl(playerUrl)) throw new Error('unsupported URL');
  } catch {
    showError('The stream URL is missing or not in the supported test-server list.');
    return;
  }

  const playerFrame = document.createElement('iframe');
  playerFrame.title = 'Popup-restricted Rabbitv3 stream';
  playerFrame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
  playerFrame.referrerPolicy = 'no-referrer';
  playerFrame.setAttribute('allowfullscreen', '');
  // The provider is fetched through a same-origin Pages Function. This lets
  // the proxy inject the popup guard without triggering iframe sandbox checks.
  playerFrame.src = `/proxy?url=${encodeURIComponent(playerUrl.href)}`;
  document.body.appendChild(playerFrame);

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || !event.data) return;
    if (!['PLAYER_COMMAND', 'SET_CURRENT_TIME'].includes(event.data.type)) return;
    playerFrame.contentWindow?.postMessage(event.data, window.location.origin);
  });

  window.addEventListener('message', (event) => {
    if (event.source !== playerFrame.contentWindow || event.data?.type !== 'PLAYER_EVENT') return;
    window.parent.postMessage(event.data, window.location.origin);
  });
})();
