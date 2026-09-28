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
