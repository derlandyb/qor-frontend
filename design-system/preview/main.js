// Vix Rock Discovery — static approval sample interactivity.
// Purely cosmetic: toggles the favorite icon's filled/outline state for a
// tactile preview. No backend call, no persistence — favorites' real
// behavior belongs to the (later) `favorites` feature.

document.querySelectorAll("[data-favorite-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const isPressed = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!isPressed));
  });
});
