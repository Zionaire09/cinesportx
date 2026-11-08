# CineSportX Static-Asset and SPA Routing Resolution

## Incident Summary

The deployed application rendered its navigation shell but not its React content. The browser console showed that requests for Vite JavaScript chunks, including `index-*.js` and vendor chunks, received an HTML response rather than JavaScript. It also reported that `/manifest.webmanifest` was HTML rather than a web manifest.

> A JavaScript module must be delivered with a JavaScript MIME type. When an application shell is returned for a module request, the browser refuses to execute that module and the React application cannot start.

## Root Cause

The repository combined two mutually overlapping routing mechanisms. The `public/_redirects` file used the unconditional rule `/* /index.html 200`, while the Worker configuration already used the native static-asset SPA fallback, `not_found_handling = "single-page-application"`.

The catch-all redirect could rewrite a missing or incorrectly matched asset request to `index.html`. That response has the `text/html` MIME type, which explains the module-loading failure. The HTML template also referenced `/manifest.webmanifest` and `/registerSW.js`, but those files were not part of the generated deployment artifact. Those requests were similarly routed to the application shell.

## GitHub Source Correction

The source repository now has a single routing authority: the native Worker static-asset fallback in `wrangler.toml`. The Cloudflare Pages-style `public/_redirects` file has been removed. This preserves direct React Router navigation while allowing actual files in `dist/assets/` to be served as JavaScript and CSS rather than as the application HTML.

The obsolete manifest and service-worker registration tags were also removed from `index.html`, because the corresponding files were absent from the build output. Finally, the Worker name in `wrangler.toml` was aligned with the user-designated deployment service, `cineby`.

| File | Change | Reason |
|---|---|---|
| `wrangler.toml` | Sets `name = "cineby"`; retains `not_found_handling = "single-page-application"` | Aligns the source configuration with the designated Worker while retaining native SPA handling. |
| `public/_redirects` | Removed | Prevents an unconditional redirect from returning HTML for static-asset requests. |
| `index.html` | Removes manifest and service-worker registration references | Stops requests for deployment files that are not generated. |

## Verification Procedure

Run the following commands from the repository root after dependency installation:

```bash
pnpm run build
```

The generated `dist/index.html` should reference Vite assets under `/assets/`, and the matching files must exist under `dist/assets/`. When the GitHub-connected deployment completes, refresh the site with cache disabled and confirm in the browser network panel that each `*.js` request returns JavaScript rather than HTML. Direct visits to application routes should still load the React shell through the Worker configuration.

## Scope and Deployment Boundary

This correction changes GitHub repository source only. It does not perform any dashboard operation or change any Cloudflare service configuration. The intended deployment service is **cineby**; no changes should be made to the separate `cinesportx` Worker.

## Complete Artifact Publication

A subsequent comparison with RabbitV1 established the remaining deployment difference. The Git-tracked `dist/index.html` referenced hash-named Vite modules, but `dist/assets/` was excluded by the ignore rule and had not been committed. A deployment that publishes repository files without rebuilding therefore served the application shell for those missing module paths.

CineSportX now matches RabbitV1’s build fallback behavior by running `vite build && cp dist/index.html dist/404.html`. The complete generated `dist` release is committed with the HTML that references it, including every JavaScript and CSS file under `dist/assets/`.

| Validation check | Result |
|---|---|
| Each asset URL in `dist/index.html` exists in `dist/assets/` | Passed |
| Generated JavaScript response in a local production preview | `Content-Type: text/javascript` |
| Direct `/sports` route response in the same preview | `Content-Type: text/html` application shell |

> For this deployment model, `dist/index.html` and its hash-named `dist/assets/*` dependencies are a single release artifact and must always be committed together.
