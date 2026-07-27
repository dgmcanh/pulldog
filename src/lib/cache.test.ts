import { beforeEach, describe, expect, it, vi } from "vitest";
import { cached, clearCache, tokenKey } from "./cache";

beforeEach(() => {
  clearCache();
});

describe("cached", () => {
  it("serves a hit within the TTL without reloading", async () => {
    const load = vi.fn(async () => "value");

    expect(await cached("k", 60_000, load)).toBe("value");
    expect(await cached("k", 60_000, load)).toBe("value");
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("reloads once the entry expires", async () => {
    let calls = 0;
    const load = async () => `value-${++calls}`;

    expect(await cached("k", 0, load)).toBe("value-1");
    expect(await cached("k", 0, load)).toBe("value-2");
  });

  it("keys entries separately", async () => {
    await cached("a", 60_000, async () => "a-value");
    await cached("b", 60_000, async () => "b-value");

    expect(await cached("a", 60_000, async () => "reloaded")).toBe("a-value");
  });

  it("shares one in-flight request between concurrent callers", async () => {
    const load = vi.fn(async () => "value");

    const [a, b] = await Promise.all([
      cached("k", 60_000, load),
      cached("k", 60_000, load),
    ]);

    expect([a, b]).toEqual(["value", "value"]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("does not serve a failed load for the rest of the TTL", async () => {
    let attempts = 0;
    const load = async () => {
      if (++attempts === 1) throw new Error("boom");
      return "recovered";
    };

    await expect(cached("k", 60_000, load)).rejects.toThrow("boom");
    await expect(cached("k", 60_000, load)).resolves.toBe("recovered");
  });
});

describe("tokenKey", () => {
  const token = "ghp_supersecret";

  it("never carries the raw token", () => {
    expect(tokenKey(token)).not.toContain(token);
    expect(tokenKey(token)).toHaveLength(16);
  });

  it("is stable per token and distinct across tokens", () => {
    expect(tokenKey(token)).toBe(tokenKey(token));
    expect(tokenKey("other")).not.toBe(tokenKey(token));
  });
});
