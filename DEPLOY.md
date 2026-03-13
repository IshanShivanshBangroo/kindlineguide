# Deployment guide

This project is meant to be deployed as a **Cloudflare Pages** project with **Pages Functions** and a **Workers AI** binding.

## What to upload

Upload the **entire project folder** to a GitHub repository. Do not upload only the `public` folder. The deployment needs:

- `public/` for the website,
- `functions/` for backend routes,
- `lib/` for gating and prompting logic,
- `wrangler.jsonc` for Pages configuration.

## Build settings

Use these settings in Cloudflare Pages:

- **Framework preset:** None
- **Build command:** leave blank
- **Build output directory:** `public`

## Important routes after deployment

- `/` → participant-facing support tool
- `/research.html` → researcher-facing inspection console
- `/api/health` → health check
- `/api/config` → frontend configuration
- `/api/chat` → support turn endpoint
- `/api/evaluate` → built-in evaluation suite

## AI binding

Confirm that the Workers AI binding is named `AI`. If it does not appear after import:

1. Open the Pages project.
2. Go to **Settings** → **Bindings**.
3. Add a **Workers AI** binding.
4. Name it `AI`.
5. Redeploy.

## Local development

```bash
npm install
npx wrangler login
npm run dev
```

## Immediate post-deployment checks

1. `/api/health` returns JSON.
2. `/` loads the participant view.
3. `/research.html` loads the research console.
4. A normal reflective prompt works in the participant view.
5. The threshold slider appears only in the research console.
6. The built-in evaluation runs from the research console.
