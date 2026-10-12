# Rabbitv3 CSP sandbox test wrapper

This directory is intended to be deployed as a **separate Cloudflare Pages project**, leaving the main rabbitv3 Worker deployment unchanged.

The Armageddon source (`vidsrc-mov`) now loads the direct Vsembed player (`vsembed.ru`) through this wrapper in production. Popup blocking is implemented with an explicit sandbox on the provider iframe, not with a CSP sandbox on the wrapper document.

The project root (`/`) provides a manual test page for all 19 current rabbitv3 video sources. It builds provider-specific movie or TV URLs and loads the selected one at `/wrapper?url=<encoded-provider-embed-url>`; opening `/wrapper` with no `url` parameter will show an invalid/missing URL message by design.

## Cloudflare Pages settings

- Connect the existing `jrevelacion/rabbitv3` repository.
- Set the project root directory to `cloudflare-pages-wrapper`.
- Leave the build command empty.
- Set the build output directory to `.`.
- Deploy the `master` branch.

Cloudflare Pages serves `wrapper.html` and applies the adjacent `_headers` rules to its response. Use the resulting `https://<project>.pages.dev` URL to access this isolated test harness; production rabbitv3 playback is not routed through it.

## Popup restriction

The wrapper applies `sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"` directly to the Vsembed iframe. It deliberately omits `allow-popups`, `allow-popups-to-escape-sandbox`, and top-navigation permissions. This is the browser mechanism that prevents the provider document and its nested player from opening a new browsing context.

The restriction suppresses popup windows while preserving scripts, same-origin checks, forms, and fullscreen presentation. Provider behavior can still change, so playback must be tested in the deployed Pages project.

## Traffic boundary

This is a static wrapper, not a reverse proxy. Pages serves the wrapper document and its small script. The browser still fetches the Vsembed player, media, and other third-party resources directly from their respective hosts; those requests do not pass through Pages.
