(() => {
  'use strict';

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
    if (playerUrl.origin !== 'https://vidsrc.mov' || !validPath) {
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
  // Deliberately omit allow-popups and allow-top-navigation. This can prevent
  // popup-based ads, but does not block ad subresources inside the provider.
  playerFrame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
  playerFrame.src = playerUrl.href;
  document.body.appendChild(playerFrame);

  // Preserve the app's resume-seek messages while keeping the bridge restricted
  // to the known upstream origin and expected command types.
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.origin !== window.location.origin) return;
    if (!event.data || !['PLAYER_COMMAND', 'SET_CURRENT_TIME'].includes(event.data.type)) return;
    playerFrame.contentWindow?.postMessage(event.data, playerUrl.origin);
  });

  // Forward only the progress event consumed by rabbitv3's watch-history logic.
  window.addEventListener('message', (event) => {
    if (event.source !== playerFrame.contentWindow || event.origin !== playerUrl.origin) return;
    if (event.data?.type !== 'PLAYER_EVENT') return;
    window.parent.postMessage(event.data, window.location.origin);
  });
})();
