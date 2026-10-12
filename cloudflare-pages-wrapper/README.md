# Armageddon static player wrapper

This directory is intended to be deployed as a **separate Cloudflare Pages project**, leaving the main rabbitv3 Worker deployment unchanged.

**Known limitation:** VidSrc detects the inherited CSP sandbox and refuses to play in this setup. The wrapper is therefore an isolated experiment and is not used by the main rabbitv3 player; Server 1 should remain a direct embed unless a non-sandbox popup-blocking method is found.

The project root (`/`) provides a small manual test page. The embedded player page is served at `/wrapper?url=<encoded-vidsrc-embed-url>`; opening `/wrapper` with no `url` parameter will show an invalid/missing URL message by design.

## Cloudflare Pages settings

- Connect the existing `jrevelacion/rabbitv3` repository.
- Set the project root directory to `cloudflare-pages-wrapper`.
- Leave the build command empty.
- Set the build output directory to `.`.
- Deploy the `master` branch.

Cloudflare Pages serves `wrapper.html` and applies the adjacent `_headers` rules to its response. Use the resulting `https://<project>.pages.dev` URL in rabbitv3's player integration.

## Popup restriction

The response header applies CSP `sandbox` restrictions to the wrapper document and its embedded browsing context. It allows scripts, same-origin behavior, forms, and presentation, but deliberately does not grant `allow-popups` or top-level navigation. The VidSrc iframe element itself does **not** have a `sandbox` attribute.

This is intended to suppress popup windows opened by the embedded player. The restriction can also affect provider features that rely on popups, downloads, or top-level navigation; playback must be tested in the deployed Pages project.

## Traffic boundary

This is a static wrapper, not a reverse proxy. Pages serves the wrapper document and its small script. The browser still fetches the VidSrc player, media, and other third-party resources directly from their respective hosts; those requests do not pass through Pages.
