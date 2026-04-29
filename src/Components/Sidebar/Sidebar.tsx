import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { MenuItem } from "../../App";
import type { User } from "../../Models/Usuarios";

type Section = {
  id: "workspace" | "analysis" | "admin";
  title: string;
  subtitle: string;
};

function isRouteActive(item: MenuItem, pathname: string): boolean {
  const itemPath = item.path ?? ""
  if (!itemPath) return false;
  if (pathname === itemPath) return true;

  // Para rutas hijas como /tickets/123 cuando el menú principal es /tickets.
  return pathname.startsWith(`${itemPath}/`);
}

export function Sidebar(props: { selected: string; onSelect: (k: string) => void; user: User; collapsed?: boolean; onToggle?: () => void; sections: Section[]; items: MenuItem[] }) {
  const { selected, onSelect, user, collapsed = false, onToggle, sections, items } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    const walk = (nodes: readonly MenuItem[], path: string[] = []) => {
      nodes.forEach((n) => {
        const p = [...path, n.id];
        const activeByRoute = isRouteActive(n, location.pathname);
        const activeBySelection = n.id === selected;

        if (activeByRoute || activeBySelection) {
          p.slice(0, -1).forEach((id) => {
            next[id] = true;
          });
        }

        if (n.children?.length) walk(n.children, p);
      });
    };

    walk(items);
    setOpen((prev) => ({ ...prev, ...next }));
  }, [items, location.pathname, selected]);

  const grouped = React.useMemo(() => {
    return sections
      .map((section) => ({
        ...section,
        items: items.filter((item) => (item.section ?? "workspace") === section.id),
      }))
      .filter((section) => section.items.length > 0);
  }, [items, sections]);

  const toggle = (id: string) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  const handleFolderClick = (id: string) => {
    if (collapsed) {
      setOpen((s) => ({ ...s, [id]: true }));
      onToggle?.();
      return;
    }

    toggle(id);
  };

  const renderLeaf = (item: MenuItem, depth: number) => {
    const itemPath = item.path ?? ""
    const active = isRouteActive(item, location.pathname) || selected === item.id;
    const className = `sideItem sideItem--leaf ${active ? "sideItem--active" : ""} ${collapsed ? "is-compact" : ""} ${depth > 0 ? "sideItem--sub" : ""}`;

    if (!itemPath) {
      return (
        <button type="button" className={className} onClick={() => onSelect(item.id)} aria-current={active ? "page" : undefined} title={item.label}>
          <span className="sideItem__icon" aria-hidden="true">{item.icon ?? "•"}</span>
          {!collapsed && (
            <span className="sideItem__content">
              <span className="sideItem__label">{item.label}</span>
            </span>
          )}
        </button>
      );
    }

    return (
      <NavLink to={itemPath} className={() => className} aria-current={active ? "page" : undefined} title={item.label} onClick={() => onSelect(item.id)}>
        <span className="sideItem__icon" aria-hidden="true">{item.icon ?? "•"}</span>
        {!collapsed && (
          <span className="sideItem__content">
            <span className="sideItem__label">{item.label}</span>
          </span>
        )}
      </NavLink>
    );
  };

  const renderTree = (nodes: readonly MenuItem[], depth = 0) => (
    <ul className={`sb-ul ${depth > 0 ? "sb-ul--nested" : ""}`}>
      {nodes.map((n) => {
        const hasChildren = !!n.children?.length;
        const expanded = !!open[n.id];

        if (hasChildren) {
          return (
            <li key={n.id} className="sb-li">
              <button type="button" className={`sideItem sideItem--folder ${collapsed ? "is-compact" : ""} ${expanded ? "is-open" : ""}`} onClick={() => handleFolderClick(n.id)} aria-expanded={!collapsed && expanded} title={n.label}>
                <span className="sideItem__icon" aria-hidden="true">{n.icon ?? null}</span>
                {!collapsed && (
                  <>
                    <span className="sideItem__label">{n.label}</span>
                    <span className={`sideItem__caret ${expanded ? "is-rotated" : ""}`} aria-hidden="true">⌄</span>
                  </>
                )}
              </button>
              {!collapsed && expanded && <div className="sideGroup">{renderTree(n.children!, depth + 1)}</div>}
            </li>
          );
        }

        return (
          <li key={n.id} className="sb-li">
            {renderLeaf(n, depth)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside className={`workspace-nav ${collapsed ? "workspace-nav--collapsed" : ""}`} aria-label="Navegación principal">
      <div className="workspace-nav__brand">
        <div className="workspace-nav__brand-mark" aria-hidden="true">
          <span className="workspace-nav__brand-gem" />
        </div>
        {!collapsed && (
          <div className="workspace-nav__copy">
            <span className="workspace-nav__eyebrow">Support System</span>
            <span className="workspace-nav__title">SA HelpDesk</span>
          </div>
        )}
        <button type="button" className="workspace-nav__brand-toggle" onClick={onToggle} aria-label={collapsed ? "Expandir menú" : "Contraer menú"}>
          <span aria-hidden="true">{collapsed ? "»" : "«"}</span>
        </button>
      </div>

      <div className="workspace-nav__sections">
        {grouped.map((section) => (
          <section key={section.id} className="nav-cluster">
            {!collapsed && (
              <header className="nav-cluster__header">
                <span className="nav-cluster__title">{section.title}</span>
              </header>
            )}
            {renderTree(section.items)}
          </section>
        ))}
      </div>

      <div className="workspace-nav__bottom">
        <div className="workspace-nav__footer-actions">
          {!collapsed && (
            <button type="button" className="workspace-nav__theme-btn" aria-label="Acciones rápidas">
              <span aria-hidden="true">◌</span>
            </button>
          )}
        </div>

        <div className="workspace-nav__profile">
          <div className="workspace-nav__avatar">{user?.displayName?.[0] ?? "U"}</div>
          {!collapsed && (
            <div className="workspace-nav__profile-copy">
              <span className="workspace-nav__profile-name">{user?.displayName ?? "Usuario"}</span>
              <span className="workspace-nav__profile-role">Administrador</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
