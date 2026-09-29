# $NEO — Planetary Defense Fund

Vercel-ready static frontend + serverless API routes.

## Vercel deployment

Import this repository as a **new** Vercel project.

Use these settings during import:

- Framework Preset: **Other**
- Root Directory: **./**
- Build Command: **None / empty**
- Output Directory: **None / empty**
- Install Command: **None / empty**

The repository also sets `"framework": null` in `vercel.json` so Vercel does not classify the browser-side `app.js` as a Node application.

### Environment variables

Set:

- `ADMIN_KEY` — a long private password used by `/admin.html`

For persistent admin data, connect an Upstash Redis database and expose either:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

or Vercel KV-compatible names:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Without Redis, the public site still loads with default config, but admin saves will return a storage-not-configured error.

## Routes

- `/` — static website
- `/admin.html` — admin UI
- `/api/neo` — NASA/JPL close-approach proxy
- `/api/config` — persistent public/admin configuration

## Architecture

`index.html`, `styles.css`, and `app.js` are browser/static assets. Only files inside `api/` are Vercel Functions. Do not change the Vercel Framework Preset to Node.
