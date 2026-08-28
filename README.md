# Customer Portal (Next.js)

The customer self-service tracking portal. Each delivery has a unique link `/track/<token>` — the token is the only credential (no login).

## Setup

```bash
npm install
npm run dev -- --port 3001     # http://localhost:3001
```

Requires the API at `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL` in `.env.local`).

## What's here

- **Live ETA** with a ticking countdown and a delivery-status badge (on time / running late / delayed).
- **Map** with the destination pin and the approximate driver position.
- **Status timeline** (order placed → out for delivery → delivered).
- **Reschedule**: pick a later window; the agent treats it as a constraint change and re-plans the route around it — the same cascade as a driver exception.
- **Confirm delivery**.

Polls `/api/track/{token}` every 5s.

## Config

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Get a tracking token from the console (each stop's detail card links here) or from the API: `GET /api/state` → any stop's `tracking_token`.
