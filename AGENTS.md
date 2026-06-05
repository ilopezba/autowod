# AutoWOD — Agent Context

## Commands

```bash
pnpm dev          # Run bot locally (loads .env automatically)
pnpm start        # Run bot in production mode
pnpm typecheck    # TypeScript type checking
pnpm lint         # Lint TypeScript files
pnpm format       # Format with Prettier
pnpm test         # Run tests with vitest
```

## Architecture

AutoWOD is a headless browser bot that automatically books CrossFit sessions on WODBuster-powered gym platforms. It runs on a cron schedule via GitHub Actions.

**Main flow (`src/index.ts`):**
1. Load `booking-state.json` and exit early if all upcoming bookable days are already handled (no CAPTCHA needed)
2. Launch Puppeteer (headless in CI, headed locally — detected via `CI` env var)
3. Solve Cloudflare Turnstile CAPTCHA via 2Captcha API (CI only)
4. Authenticate with email/password (optional 2FA device selection)
5. Navigate the reservations page and book sessions for each upcoming day
6. Save updated booking state to `booking-state.json`
7. Log a summary of results (booked / waitlisted / already booked / skipped)

**Services (`src/services/`):**
- `auth.ts` — login form submission and 2FA handling
- `captcha.ts` — injects `scripts/captcha-interceptor.js` into the page to intercept Turnstile parameters, sends them to 2Captcha, then injects the token back. Retries up to 3 times with a 5s gap.
- `reservation.ts` — iterates over available days, reads button state labels (Spanish: "Entrenar" = available, "Avisar" = waitlist, "Borrar" = already booked), and performs bookings
- `state.ts` — loads/saves `booking-state.json`, computes upcoming bookable dates, and checks whether all are already in a terminal state (booked / waitlisted / finished / different-time). Used to skip runs that have nothing left to do.

**Configuration (`src/config.ts`):**
`BASE_URL` is hardcoded to `https://wodbuster.com`. All other config is loaded from environment variables. The `.env.example` file lists every variable. Key ones:

| Variable | Purpose | Where to set |
|---|---|---|
| `EMAIL`, `PASSWORD` | Gym account credentials | GitHub Secret |
| `TWO_CAPTCHA_API_KEY` | 2Captcha API key for CAPTCHA solving | GitHub Secret |
| `MONDAY`–`SUNDAY` | Preferred time slot per day (24h, e.g. `17:00`, or `17:00\|CrossFit` for class name) | GitHub Variable |
| `AVAILABLE_DAYS` | Booking horizon in days (default: 7) | GitHub Variable |
| `CI` | Set automatically by GitHub Actions; enables headless mode and CAPTCHA solving | — |

Copy `.env.example` to `.env` for local development.

## Known behaviour

- All `waitForNetworkIdle` calls use `{ timeout: 5000 }.catch(() => {})` because WODBuster keeps long-polling connections open that prevent the network from ever going fully idle.
- The captcha flow retries up to 3 times — Cloudflare Turnstile occasionally fails to render on the first attempt in GitHub Actions.
