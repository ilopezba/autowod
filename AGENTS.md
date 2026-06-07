All `waitForNetworkIdle` calls use `{ timeout: 5000 }.catch(() => {})` — WODBuster keeps long-polling connections open that prevent the network from going fully idle.

The captcha flow retries up to 3 times — Cloudflare Turnstile occasionally fails to render on the first attempt in GitHub Actions.
