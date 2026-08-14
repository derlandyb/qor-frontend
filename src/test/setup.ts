import "@testing-library/jest-dom/vitest";

// jsdom has no IntersectionObserver implementation — the feed's infinite-scroll sentinel
// (useEventFeed's sentinelRef) needs a stand-in so components using it can mount in tests.
// Tests that need to actually trigger a scroll-triggered fetch call the stored callback
// directly via (globalThis as any).__intersectionObserverCallbacks.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
