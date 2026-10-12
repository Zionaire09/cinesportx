import { onRequest as handleProxy } from './functions/proxy.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/proxy') {
      return handleProxy({ request, env, ctx });
    }

    return env.ASSETS.fetch(request);
  },
};
