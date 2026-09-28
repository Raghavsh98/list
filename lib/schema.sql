-- The database is an index over portable documents, not a second source of truth.
-- Every list is stored whole as JSONB exactly as core/validate.ts produced it; the
-- columns beside it exist only so we can find, sort and filter without parsing.

create extension if not exists pg_trgm;

create table if not exists profiles (
  handle     text primary key,
  name       text not null,
  bio        text,
  link       text,
  created_at timestamptz not null default now()
);

create table if not exists lists (
  id          text not null,
  handle      text not null references profiles (handle) on delete cascade,
  slug        text not null,
  visibility  text not null default 'public' check (visibility in ('public', 'unlisted')),
  doc         jsonb not null,
  search_text text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (handle, slug)
);

create index if not exists lists_feed_idx on lists (updated_at desc) where visibility = 'public';
create index if not exists lists_search_idx on lists using gin (search_text gin_trgm_ops);
