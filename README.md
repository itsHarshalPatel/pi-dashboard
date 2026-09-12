# Pi Dashboard

A live status dashboard for my self-hosted Raspberry Pi 5 home server —
CPU/memory/disk stats, uptime, and Docker container health, updating every
5 seconds.

## Architecture

Raspberry Pi 5 ──> pi-stats-api (Docker container)
│
Tailscale Funnel (public HTTPS)
│
This dashboard (Next.js, deployed on Vercel) ──> fetches live JSON


The Pi runs Docker containers for Nextcloud (private cloud storage),
Jellyfin (music streaming), Portainer (container management), and this
stats API — all self-hosted. This dashboard is the only piece not running
on the Pi; it's deployed separately on Vercel and pulls live data from the
Pi over Tailscale Funnel.

## Stack
Next.js, TypeScript, Tailwind CSS, Recharts

## Related
- [pi-stats-api](https://github.com/itsHarshalPatel/pi-stats-api) — the API this dashboard reads from
