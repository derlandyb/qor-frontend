import { render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useGoogleIdentityServices } from "./useGoogleIdentityServices";

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function TestButton({ onCredential }: { onCredential: (idToken: string) => void }) {
  const { containerRef } = useGoogleIdentityServices("client-123", onCredential);
  return <div ref={containerRef} />;
}

describe("useGoogleIdentityServices", () => {
  afterEach(() => {
    document.querySelectorAll(`script[src="${GSI_SCRIPT_SRC}"]`).forEach((node) => node.remove());
    delete window.google;
    vi.restoreAllMocks();
  });

  it("given no client id when rendered then no script is loaded and it reports unconfigured", () => {
    const { result } = renderHook(() => useGoogleIdentityServices("", vi.fn()));

    expect(document.querySelector(`script[src="${GSI_SCRIPT_SRC}"]`)).toBeNull();
    expect(result.current.isConfigured).toBe(false);
  });

  it("given a client id when rendered then the GSI script is appended to the document head", () => {
    renderHook(() => useGoogleIdentityServices("client-123", vi.fn()));

    expect(document.querySelector(`script[src="${GSI_SCRIPT_SRC}"]`)).not.toBeNull();
  });

  it("given the script has already loaded when the credential callback fires then onCredential receives the id token", () => {
    const initialize = vi.fn(({ callback }: { callback: (r: { credential: string }) => void }) => {
      callback({ credential: "google-id-token" });
    });
    const renderButton = vi.fn();
    window.google = { accounts: { id: { initialize, renderButton } } };

    const onCredential = vi.fn();
    render(<TestButton onCredential={onCredential} />);

    expect(onCredential).toHaveBeenCalledWith("google-id-token");
    expect(renderButton).toHaveBeenCalled();
  });
});
