import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GoogleSignInButton } from "./GoogleSignInButton";

// VITE_GOOGLE_CLIENT_ID is unset in this repo's default .env.example/.env (see
// GoogleSignInButton's own scope note) — the test environment matches that default exactly,
// so no env stubbing is needed to exercise the "unconfigured" path.
describe("GoogleSignInButton", () => {
  it("given no configured Google client id when rendered then nothing is rendered", () => {
    render(<GoogleSignInButton onCredential={vi.fn()} />);

    expect(screen.queryByTestId("google-signin-button")).not.toBeInTheDocument();
  });
});
