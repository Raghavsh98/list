# List

Make a list. Mean it. Pass it on.

A small platform for making and sharing lists. Every list is a portable file first (`core/`), a tiny renderer second (`components/list/`), and a URL third (`app/`).

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000/raghav/design-reading
pnpm test       # core/ format tests
pnpm lint
pnpm build
```

## Layout

```
core/             portable format: types, validate, json, markdown, ids, slug, favicon
components/list/  <List> renderer + spins + reader-side check island
starters/         example lists (reading list, ranking, bucket list)
lib/              platform data access (hardcoded for now)
app/              routes: /[handle], /[handle]/[slug], /api/favicon
```

See `AGENTS.md` for layer rules.
