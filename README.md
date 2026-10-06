# Garage Sidequests

Technology is more fun off the main quest.

A small static site for Ty’s real technical projects: hardware reuse, homelabs, electronics, automation, and whatever happens next. Canonical domain: https://garagesidequests.com. Public contact: hello@garagesidequests.com.

## Development

Use Node 24 LTS (minimum 22.12) and npm. No environment variables or credentials are required to build the site.

```sh
npm ci
npm run dev
npm run check
npm run format:check
npm run build
npm run preview
```

Development and preview default to http://localhost:4321. Production output is `dist/`. `npm test` requires the preview running and Chrome at `/usr/bin/google-chrome`; set `CHROME_PATH` and `TEST_URL` to override. It checks links, accessibility using axe, keyboard focus, metadata utilities, and four viewport widths. Screenshots stay in ignored `test-results/`.

## Architecture

Astro 7, TypeScript, native Astro components, Markdown, system fonts, and static HTML/CSS. There are no client frameworks, runtime server, database, analytics, cookies, or external font requests. RSS and sitemap are generated at build time. The SVG mark and bench illustration are original; the social preview is a locally generated PNG from the SVG source.

- `src/content.config.ts`: typed Quest, log, and gear schemas.
- `src/content/quests/`: durable project hubs; filenames are collection IDs.
- `src/content/log/`: chronological entries referencing Quest IDs.
- `src/content/gear/`: optional structured equipment, empty initially.
- `src/pages/`: static routes, RSS, and utility pages.
- `src/components/`: navigation, cards, badges, SEO, photos, and disclosures.
- `src/styles/global.css`: responsive design and accessible focus styles.
- `public/`: favicon, social card, robots, security headers, and future downloads.

Empty log/gear collections intentionally have no fabricated entries. Astro may report empty-collection warnings; these are expected for V1.

### Add a Quest

Create `src/content/quests/your-project.md`:

```yaml
---
title: Your project
slug: your-project
status: planned
summary: A concise statement of the actual objective.
tags: [Electronics]
featured: false
---
```

Write Markdown below the frontmatter. Use only sections that help: Objective, Current Status, Hardware, What Works, Known Issues, Guides. Status is one of `planned`, `active`, `paused`, `complete`, `abandoned`. Optional metadata includes description, startDate, updatedDate, heroImage, githubUrl, videoUrl, externalLinks, gear, downloads, and products. Dates are ISO dates; do not invent them. Slugs must be unique. Quest index groups by status without JavaScript; the homepage selects active projects automatically.

### Add a Quest Log entry

Create a flat file in `src/content/log/`, such as `firmware-test.md`:

```yaml
---
title: A real observation from the bench
date: 2026-10-06
quest: meraki-mr53-openwrt
summary: Describe what actually happened.
tags: [OpenWrt]
draft: true
---
```

Add the actual notes below the frontmatter. Set `draft: false` when ready. Drafts and future-dated posts are excluded from routes, global/Quest logs, RSS, and sitemap. Future posts appear only after a rebuild. Files must use flat, URL-safe filenames. Images, externalLinks, githubUrl and videoUrl are optional. Entries sort newest first.

### Images, gear, and commercial resources

Put future real photos in `public/images/quests/<slug>/` and downloads in `public/downloads/<slug>/`. Remove GPS/EXIF metadata and check visible labels/screens for private information before publishing. Resize/compress photos before adding; supply descriptive alt text and actual width/height. The `Photo` component reserves space, loads lazily, supports captions, and scales responsively. For optimized responsive derivatives, Astro’s `Image`/`Picture` can be used with imported files in `src/assets/`; no remote image service is required.

Image metadata format: `{ src: /images/quests/example/photo.webp, alt: Descriptive text, width: 1200, height: 800, caption: Optional caption }`.

A gear file has `title`, `summary`, and optional `links`. Quest `gear` is an array of gear filename IDs. Links/downloads/products use `{ label, url, affiliate: false }`. Use `affiliate: true` for actual affiliate relationships: resource lists mark the link, set `rel="sponsored"`, and show `AffiliateDisclosure`. Disclose affiliate links manually in Markdown near the link too; arbitrary Markdown links cannot be detected automatically. No affiliate program or store is configured.

## Git identity and privacy

The repository name is `website`: a simple convention under the brand organization, independent of hosting provider or domain changes.

Before **any** commit, inspect global and local identity privately. Never copy an unrelated identity into documentation or commits, and never change the global settings:

```sh
git config --global user.name
git config --global user.email
git config --local user.name
git config --local user.email
git config --local user.name Ty
git config --local user.email ty@garagesidequests.com
git config --local --list
```

The commit-only address is not a public contact and must not be rendered by the website. Check `git log --format=fuller` before pushing. Do not change GitHub account profiles or organization membership visibility. Keep public identity limited to Ty and the supplied brand information. No secrets or account credentials belong here.

## GitHub

After authenticating with an account authorized to create organization repositories:

```sh
gh auth login
gh repo create GarageSideQuests/website --public --source=. --remote=origin --push
```

If the repository already exists, use:

```sh
git remote add origin https://github.com/GarageSideQuests/website.git
git push -u origin main
```

Choose repository visibility consciously. No remote is created automatically by this implementation.

## Cloudflare deployment

The current [Astro deployment guide](https://docs.astro.build/en/guides/deploy/cloudflare/) recommends Workers for new Cloudflare projects. This site uses [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) only, without an adapter, Worker script, or paid features. `wrangler.jsonc` points at `./dist` and uses the custom `404.html` response rather than an SPA fallback.

1. In Cloudflare Workers & Pages, create a Worker with Git integration and connect `GarageSideQuests/website`. Authorize only the needed repository.
2. Production branch: `main`; root directory: repository root.
3. Build command: `npm run build` (Cloudflare installs dependencies; use `npm ci` if configuring installation explicitly).
4. Deploy command: `npx wrangler deploy`; output/assets directory: `dist`, already configured in Wrangler.
5. Set build variable `NODE_VERSION=24` if the platform’s default is older. No application environment variables or secrets are required. Cloudflare manages Git integration credentials; do not commit tokens.
6. Preview the deployed `workers.dev` address. Test routes and 404 before connecting the domain.
7. Under Worker Settings → Domains & Routes → Custom Domains, add `garagesidequests.com`. Follow Cloudflare’s zone and domain-verification process. Review any DNS records the dashboard proposes; do not overwrite existing records blindly. Nameserver/DNS changes require Ty.
8. Add `www.garagesidequests.com` as an additional custom domain. In the zone’s Redirect Rules, create a Single Redirect matching hostname `www.garagesidequests.com`, with dynamic destination `concat("https://garagesidequests.com", http.request.uri.path)`, status 301, and preserve query string. Test deep paths and query strings. Canonicals always use the apex.
9. Optionally redirect HTTP to HTTPS in zone settings. Leave analytics disabled unless intentionally configured and the privacy page updated.

Local deployment verification without account access:

```sh
npm run build
npx wrangler deploy --dry-run
npx wrangler dev --port 8787
```

Manual authenticated deployment is also available via `npx wrangler login` and `npm run deploy`. Do not run it until the intended account/project is verified. No DNS changes are automated.

## Deferred intentionally

Real photography, the first genuine Quest Log, structured gear entries, guides, analytics, monetization, and account connections. No search, CMS, authentication, newsletter, store, or comments. The website is infrastructure for the projects.
