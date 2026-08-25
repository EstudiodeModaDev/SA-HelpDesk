import * as React from "react";
import { usePermissions } from "./usePermissions";

type PermissionsContextValue = ReturnType<typeof usePermissions>;

const PermissionsContext = React.createContext<PermissionsContextValue | null>(null);

/**
 * Carga los permisos una sola vez y los expone al Sidebar y a los guards de rutas.
 */
export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const value = usePermissions();
  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissionsContext(): PermissionsContextValue {
  const ctx = React.useContext(PermissionsContext);
  if (!ctx) throw new Error("usePermissionsContext debe usarse dentro de PermissionsProvider");
  return ctx;
}
