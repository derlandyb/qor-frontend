import { createContext } from "react";

export interface GatedActionContextValue {
  gate<T>(action: () => T | Promise<T>): void;
}

export const GatedActionContext = createContext<GatedActionContextValue | undefined>(undefined);
