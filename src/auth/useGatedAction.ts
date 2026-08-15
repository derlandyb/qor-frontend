import { useContext } from "react";
import { GatedActionContext } from "./GatedActionContext";

export function useGatedAction() {
  const context = useContext(GatedActionContext);
  if (context === undefined) {
    throw new Error("useGatedAction must be used within a GatedActionProvider");
  }
  return context.gate;
}
