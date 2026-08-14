import { NavLink } from "react-router-dom";
import { Icon } from "../icons/Icon";
import { NAV_ITEMS } from "./navItems";

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            isActive ? "bottom-nav__item bottom-nav__item--active" : "bottom-nav__item"
          }
        >
          {({ isActive }) => (
            <>
              <span className="bottom-nav__icon-wrap">
                <Icon name={item.icon} />
                {isActive && <span className="bottom-nav__dot" aria-hidden="true" />}
              </span>
              <span className="caption">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
