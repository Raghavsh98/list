import { describe, expect, it } from "vitest"
import { allow } from "./rate-limit"

describe("rate limit", () => {
  it("allows up to max hits in the window, then refuses until the window slides", () => {
    const key = `t-${Math.random()}`
    const t0 = 1_000_000
    expect(allow(key, 3, 1000, t0)).toBe(true)
    expect(allow(key, 3, 1000, t0 + 10)).toBe(true)
    expect(allow(key, 3, 1000, t0 + 20)).toBe(true)
    expect(allow(key, 3, 1000, t0 + 30)).toBe(false)
    expect(allow(key, 3, 1000, t0 + 1001)).toBe(true)
  })

  it("keeps keys independent", () => {
    const a = `a-${Math.random()}`
    const b = `b-${Math.random()}`
    expect(allow(a, 1, 1000, 0)).toBe(true)
    expect(allow(a, 1, 1000, 1)).toBe(false)
    expect(allow(b, 1, 1000, 1)).toBe(true)
  })
})
