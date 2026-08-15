import { afterEach, describe, expect, it } from "vitest";
import { clearToken, readStoredToken, saveToken } from "./tokenStore";

describe("tokenStore", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("given no stored token when read then null is returned", () => {
    expect(readStoredToken()).toBeNull();
  });

  it("given a saved token when read then the same token is returned", () => {
    saveToken("abc123");

    expect(readStoredToken()).toBe("abc123");
  });

  it("given a saved token when cleared then read returns null", () => {
    saveToken("abc123");

    clearToken();

    expect(readStoredToken()).toBeNull();
  });
});
