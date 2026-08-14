import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedSearch } from "./useDebouncedSearch";

describe("useDebouncedSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("given rapid keystrokes when typed then only the final value is debounced after 300ms", () => {
    const { result } = renderHook(() => useDebouncedSearch());

    act(() => result.current.setQuery("f"));
    act(() => result.current.setQuery("fo"));
    act(() => result.current.setQuery("for"));

    expect(result.current.debouncedQuery).toBeNull();

    act(() => vi.advanceTimersByTime(300));

    expect(result.current.debouncedQuery).toBe("for");
  });

  it("given a query below the minimum length when debounced then debouncedQuery is null", () => {
    const { result } = renderHook(() => useDebouncedSearch());

    act(() => result.current.setQuery("f"));
    act(() => vi.advanceTimersByTime(300));

    expect(result.current.debouncedQuery).toBeNull();
  });

  it("given an empty or whitespace-only query when debounced then debouncedQuery is null", () => {
    const { result } = renderHook(() => useDebouncedSearch());

    act(() => result.current.setQuery("   "));
    act(() => vi.advanceTimersByTime(300));

    expect(result.current.debouncedQuery).toBeNull();
  });

  it("given a valid query when cleared when then debouncedQuery returns to null", () => {
    const { result } = renderHook(() => useDebouncedSearch());

    act(() => result.current.setQuery("rock"));
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.debouncedQuery).toBe("rock");

    act(() => result.current.setQuery(""));
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.debouncedQuery).toBeNull();
  });
});
