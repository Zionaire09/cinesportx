(() => {
  'use strict';

  const upstreamOrigin = 'https://vidsrc.mov';
  const errorBox = document.getElementById('error');
  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.style.display = 'flex';
  };

  let playerUrl;
  try {
    const rawUrl = new URLSearchParams(window.location.search).get('url');
    if (!rawUrl) throw new Error('missing URL');

    playerUrl = new URL(rawUrl);
    const validPath = /^\/embed\/(?:movie\/\d+|tv\/\d+\/\d+\/\d+)\/?$/.test(playerUrl.pathname);
    if (playerUrl.origin !== upstreamOrigin || !validPath) {
      throw new Error('URL is outside the permitted Armageddon player route');
    }
  } catch {
    showError('The Armageddon player URL is invalid. Please choose another server.');
    return;
  }

  const playerFrame = document.createElement('iframe');
  playerFrame.title = 'Armageddon stream';
  playerFrame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
  playerFrame.referrerPolicy = 'no-referrer';
  playerFrame.setAttribute('allowfullscreen', '');
  // Intentionally no iframe sandbox attribute here. The Pages response header
  // applies the popup restriction through CSP sandboxing instead.
  playerFrame.src = playerUrl.href;
  document.body.appendChild(playerFrame);

  // Forward only the app's known resume-seek commands to the validated provider.
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || !event.data) return;
    if (!['PLAYER_COMMAND', 'SET_CURRENT_TIME'].includes(event.data.type)) return;
    playerFrame.contentWindow?.postMessage(event.data, playerUrl.origin);
  });

  // Forward only progress events used by rabbitv3's watch-history handler.
  window.addEventListener('message', (event) => {
    if (event.source !== playerFrame.contentWindow || event.data?.type !== 'PLAYER_EVENT') return;
    window.parent.postMessage(event.data, '*');
  });
})();
