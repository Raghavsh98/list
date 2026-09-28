<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# List — project rules

Three layers, each usable without the next. Keep the arrows one-way:

- `core/` — the portable list format (types, validate, json, markdown, ids, slug, favicon). Plain TypeScript. **No React, Next, DOM, or database imports.** If the platform dies, this is what survives. Every change here needs a test in `core/core.test.ts`.
- `components/list/` — the `<List>` renderer. Imports only `core/` and React. Server component by default; `list-check.tsx` is the only client island. Must render fully with JavaScript disabled.
- `app/`, `lib/` — the platform (routes, data access, metadata). May import anything below it.

ESLint enforces these boundaries (`eslint.config.mjs`).

Craft rules:
- Public list pages: zero JS for plain/ranked, one small island for checkable. No layout shift.
- Resist adding fields to `Item`. Current fields: `id`, `text`, `url`, `credit`, `aside`.
- Spins are CSS custom properties (`--list-accent`, `--list-font`), never inline component branches.
- Monochrome by default: no spin means `--list-accent: currentColor`. No emoji, no rules or separators — spacing does that work.

Commands: `pnpm dev`, `pnpm lint`, `pnpm test` (Vitest, `core/`), `pnpm build`.
