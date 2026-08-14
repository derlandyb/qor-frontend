import { NavLink } from "react-router-dom";
import { Icon } from "../icons/Icon";
import { NAV_ITEMS } from "./navItems";

export function TopNav() {
  return (
    <header className="top-nav" aria-label="Navegação principal">
      <div className="top-nav__inner">
        <NavLink to="/" className="top-nav__brand">
          Qual o Rock?
        </NavLink>
        <nav className="top-nav__links">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                isActive ? "top-nav__link top-nav__link--active" : "top-nav__link"
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
