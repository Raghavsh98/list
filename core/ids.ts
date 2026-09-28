const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

/** Short, URL-safe, random. 10 chars of base62 ≈ 59 bits. Generated once, never regenerated. */
export function newId(length = 10): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ""
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length]
  return out
}

export const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

const SHORT_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz"

/** Six characters you can read aloud: no capitals, no 0/o, no 1/l/i. About 887 million of them. */
export function shortCode(length = 6): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ""
  for (const b of bytes) out += SHORT_ALPHABET[b % SHORT_ALPHABET.length]
  return out
}

export const SHORT_PATTERN = /^[23456789abcdefghjkmnpqrstuvwxyz]{4,12}$/
