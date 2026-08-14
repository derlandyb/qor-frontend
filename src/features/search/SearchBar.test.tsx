import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("given typing when a character is entered then onChange fires with the new value", async () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} onClear={vi.fn()} />);

    await userEvent.type(screen.getByRole("searchbox"), "r");

    expect(onChange).toHaveBeenCalledWith("r");
  });

  it("given an empty value when rendered then no clear button is shown", () => {
    render(<SearchBar value="" onChange={vi.fn()} onClear={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /limpar busca/i })).not.toBeInTheDocument();
  });

  it("given a non-empty value when the clear button is clicked then onClear fires", async () => {
    const onClear = vi.fn();
    render(<SearchBar value="rock" onChange={vi.fn()} onClear={onClear} />);

    await userEvent.click(screen.getByRole("button", { name: /limpar busca/i }));

    expect(onClear).toHaveBeenCalled();
  });
});
