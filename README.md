# $NEO — Planetary Defense Fund v2

## Run locally (full version)
The site now has a tiny Node server because two things need a backend: the JPL proxy and persistent admin updates.

```bash
cd neo-site
ADMIN_KEY="choose-a-long-private-password" npm start
```
Open http://localhost:8080
Admin: http://localhost:8080/admin.html

Do **not** share the ADMIN_KEY. It is checked server-side and is never shipped in the frontend.

## What changed
- `/api/neo` proxies NASA/JPL close-approach data, so the telemetry works despite browser CORS restrictions.
- `/admin.html` updates contract address, trading URL, fee split, fund goal, and contribution ledger without editing/redeploying the site.
- Published admin data is stored in `data/site.json`.
- Multi-layer procedural asteroids now cross the background at varied sizes, depths, directions, rotations, and speeds.
- Removed the hero “PLANETARY DEFENSE NETWORK // ONLINE” line.

## Deployment note
The host must run Node and keep `data/site.json` on persistent storage. If the platform uses an ephemeral filesystem, mount a persistent volume for `/data` or swap the config storage for a database. Set `ADMIN_KEY` as a secret environment variable on the host.
