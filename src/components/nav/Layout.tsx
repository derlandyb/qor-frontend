import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { TopNav } from "./TopNav";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <TopNav />
      <main id="main-content">{children}</main>
      <BottomNav />
    </>
  );
}
