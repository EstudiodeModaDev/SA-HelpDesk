import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { MenuItem } from "../App";
import { navs } from "../Components/Sidebar/const";
import { usePermissionsContext } from "../Funcionalidades/PermissionsContext";

function findNodeByPath(nodes: readonly MenuItem[], path: string): MenuItem | undefined {
  for (const n of nodes) {
    if (n.path === path) return n;
    if (n.children) {
      const hit = findNodeByPath(n.children, path);
      if (hit) return hit;
    }
  }
  return undefined;
}

/**
 * Bloquea el acceso directo por URL a rutas cuyo item de navegación exige un permiso
 * que el usuario no tiene, usando el mismo `permission` declarado en Sidebar/const.tsx.
 */
export function RequirePermission({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { engine } = usePermissionsContext();

  const node = findNodeByPath(navs, pathname);
  const requiredPermissions = node?.permission;

  if (requiredPermissions?.length && !engine.canAny(...requiredPermissions)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
