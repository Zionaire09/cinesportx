# Rabbitv3 popup-control wrapper

This directory is intended to be deployed as a **separate Cloudflare Pages project**, leaving the main rabbitv3 Worker deployment unchanged.

The Armageddon source (`vidsrc-mov`) loads the direct Vsembed player (`vsembed.ru`) through this wrapper in production. Popup blocking is implemented by a same-origin Cloudflare Pages Function that injects a guard into the fetched provider HTML; no iframe sandbox is used.

The project root (`/`) provides a manual test page for all 19 current rabbitv3 video sources. It builds provider-specific movie or TV URLs and loads the selected one at `/wrapper?url=<encoded-provider-embed-url>`; opening `/wrapper` with no `url` parameter will show an invalid/missing URL message by design.

## Cloudflare Pages settings

- Connect the existing `jrevelacion/rabbitv3` repository.
- Set the project root directory to `cloudflare-pages-wrapper`.
- Leave the build command empty.
- Set the build output directory to `.`.
- Deploy the `master` branch.

Cloudflare Pages serves `wrapper.html`, the static assets, and the proxy through `_worker.js` advanced mode. Use the resulting `https://<project>.pages.dev` URL to access the test harness. The Pages deployment must preserve `_worker.js` and `functions/proxy.js`; do not configure a static-only export that omits them.

## Popup restriction

The wrapper loads `/proxy?url=<encoded-provider-url>` in an ordinary, unsandboxed iframe. The proxy fetches the allowlisted provider HTML, removes conflicting frame/security headers, adds a `<base>` URL, rewrites same-provider iframe URLs, and injects early hooks for `window.open`, `fetch`, `XMLHttpRequest`, dynamically-created iframes, and blank-target links.

Because the provider document is served by the wrapper origin, its scripts see a normal iframe rather than a sandboxed browsing context. Popup windows are blocked by the injected `window.open` hook while normal player scripts, API calls, and playback requests remain available. Provider behavior can still change, so playback must be tested in the deployed Pages project.

## Traffic boundary

This is an HTML proxy, not a media proxy. Pages serves the wrapper and rewrites the allowlisted provider HTML/API/iframe requests through the Function. Media and other non-HTML resources still normally come directly from their respective upstream hosts; those requests are not stored by Pages.
