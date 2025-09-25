# NorCal NECA Member Directory Scraper (Apify Actor)

This version switches the base image to GHCR to avoid Docker Hub `unauthorized: authentication required` errors during Apify builds.

## Quick start on Apify
1. Create Actor → Import from GitHub (this repo) or upload zip.
2. **Build** (no Docker Hub auth needed).
3. **Run** with default input or set `startUrl`.

## Input schema
`INPUT_SCHEMA.json` is included so the console shows a Start URL field.

## Local run
```bash
npm i
npm run local
```

## Changelog
- 2025-09-25 — Use `ghcr.io/apify/actor-node-playwright-chrome:latest` base, add `INPUT_SCHEMA.json`.
