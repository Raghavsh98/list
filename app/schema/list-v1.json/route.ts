import { LIMITS } from "@/core/types"
import { siteUrl } from "@/lib/site"

const item = {
  type: "object",
  required: ["id", "text"],
  additionalProperties: false,
  properties: {
    id: { type: "string", pattern: "^[A-Za-z0-9_-]{1,64}$" },
    text: { type: "string", minLength: 1, maxLength: LIMITS.itemText, description: "The thing." },
    url: { type: "string", format: "uri", maxLength: LIMITS.url, description: "http(s) only; the favicon is derived from it." },
    credit: { type: "string", maxLength: LIMITS.credit, description: "Muted author, year, source." },
    aside: { type: "string", maxLength: LIMITS.aside, description: "The personal note after the link." },
    image: { type: "string", format: "uri", maxLength: LIMITS.url, description: "http(s) image URL." },
  },
}

const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: `${siteUrl}/schema/list-v1.json`,
  title: "List",
  description: "A portable list: a title, an optional subtitle, and items. formatVersion 1.",
  type: "object",
  required: ["formatVersion", "id", "title", "mode", "items", "author", "createdAt", "updatedAt"],
  properties: {
    $schema: { type: "string" },
    formatVersion: { const: 1 },
    id: { type: "string", pattern: "^[A-Za-z0-9_-]{1,64}$" },
    url: { type: "string", format: "uri", description: "Where this list lives; present in served copies." },
    title: { type: "string", minLength: 1, maxLength: LIMITS.title },
    subtitle: { type: "string", maxLength: LIMITS.subtitle },
    mode: { enum: ["plain", "ranked", "checkable"] },
    items: { type: "array", minItems: 1, maxItems: LIMITS.items, items: item },
    spin: {
      type: "object",
      required: ["color", "font"],
      additionalProperties: false,
      properties: { color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" }, font: { enum: ["serif", "sans", "mono"] } },
    },
    author: {
      type: "object",
      required: ["handle"],
      properties: { handle: { type: "string" }, name: { type: "string" } },
    },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
}

export function GET() {
  return Response.json(schema, {
    headers: {
      "content-type": "application/schema+json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=86400, s-maxage=604800",
    },
  })
}
