import * as React from "react";
import "./App.css";
import type { TicketsService } from "./services/Tickets.service";
import type { UsuariosSPService } from "./services/Usuarios.service";
import type { LogService } from "./services/Logs.service";
import type { User } from "./Models/Usuarios";
import { AuthProvider, useAuth } from "./Auth/authContext";
import Welcome from "./Components/Welcome/Welcome";
import { GraphServicesProvider, useGraphServices } from "./graph/GrapServicesContext";
import { useTheme } from "./Funcionalidades/Theme";
import { Sidebar } from "./Components/Sidebar/Sidebar";
import { type Permission } from "./config/permissions.config";
import { usePermissions } from "./Funcionalidades/usePermissions";
import HeaderPrincipal from "./Components/Header/Header";
import AppRoutes from "./Routes";
import { navs } from "./Components/Sidebar/const";
import { useLocation, useNavigate } from "react-router-dom";

type RenderCtx = { services?: { Tickets: TicketsService; Usuarios: UsuariosSPService; Logs: LogService } };
type Services = { Tickets: TicketsService; Usuarios: UsuariosSPService; Logs: LogService };

export type MenuItem = {
  id: string;
  label: string;
  section?: "workspace" | "analysis" | "admin";
  icon?: React.ReactNode;
  to?: React.ReactNode | ((ctx: RenderCtx) => React.ReactNode);
  path?: string
  children?: MenuItem[];
  permission?: Permission[];
  when?: (ctx: NavContext) => boolean;
  autocollapse?: boolean;
};

type PermissionsEngine = {
  can: (perm: Permission) => boolean;
  canAny: (...perms: Permission[]) => boolean;
  canAll: (...perms: Permission[]) => boolean;
  list: () => Permission[];
};

export type NavContext = {
  permissions?: PermissionsEngine | null;
  hasService?: (k: keyof Services) => boolean;
};

export type NavSection = {
  id: "workspace" | "analysis" | "admin";
  title: string;
  subtitle: string;
};

const SECTIONS: NavSection[] = [
  { id: "workspace", title: "Operacion", subtitle: "Flujo diario" },
  { id: "analysis", title: "Control", subtitle: "Indicadores" },
  { id: "admin", title: "Gobierno", subtitle: "ConfiguraciÃ³n" },
];

function isVisible(node: MenuItem, ctx: NavContext): boolean {
  if (node.permission && !ctx.permissions?.canAny(...node.permission)) return false;
  if (node.when && !node.when(ctx)) return false;
  return true;
}

function filterNavTree(nodes: readonly MenuItem[], ctx: NavContext): MenuItem[] {
  return nodes
    .map((n) => {
      const children = n.children ? filterNavTree(n.children, ctx) : undefined;
      const self = isVisible(n, ctx);
      if (children && children.length === 0 && !self) return null;
      if (!self && !children) return null;
      return { ...n, children };
    })
    .filter(Boolean) as MenuItem[];
}

function firstLeafId(nodes: readonly MenuItem[]): string {
  const pick = (n: MenuItem): string => (n.children?.length ? pick(n.children[0]) : n.id);
  return nodes.length ? pick(nodes[0]) : "";
}

function findById(nodes: readonly MenuItem[], id: string): MenuItem | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const hit = findById(n.children, id);
      if (hit) return hit;
    }
  }
  return undefined;
}

function Shell() {
  const { ready, account, signIn, signOut } = useAuth();
  const [loadingAuth, setLoadingAuth] = React.useState(false);
  const user: User = account ? { displayName: account.name ?? account.username ?? "Usuario", mail: account.username ?? "", jobTitle: "" } : null;
  const isLogged = Boolean(account);

  const handleAuthClick = async () => {
    if (!ready || loadingAuth) return;
    setLoadingAuth(true);
    try {
      if (isLogged) await signOut();
      else await signIn("popup");
    } finally {
      setLoadingAuth(false);
    }
  };

  if (!ready || !isLogged) {
    return (
      <div className="page layout">
        <section className="page-view">
          <Welcome onLogin={handleAuthClick} />
        </section>
      </div>
    );
  }

  return <LoggedApp user={user as User} />;
}

function LoggedApp({ user }: { user: User }) {
  const services = useGraphServices();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { engine, loading: permissionsLoading } = usePermissions();
  const auth = useAuth()

  const navCtx = React.useMemo<NavContext>(() => {
    return {
      permissions: engine,
      hasService: (k) => {
        if (k === "Usuarios") return Boolean(services?.Usuarios);
        if (k === "Tickets") return Boolean(services?.Tickets);
        if (k === "Logs") return Boolean(services?.Logs);
        return false;
      },
    };
  }, [services, engine]);

  React.useEffect(() => {
    if (location.pathname === "/") {
      navigate("/home", { replace: true });
    }
  }, [location.pathname, navigate]);

  const filterdNavs = React.useMemo(() => filterNavTree(navs, navCtx), [navCtx]);
  const [selected, setSelected] = React.useState<string>(() => firstLeafId(filterdNavs));

  React.useEffect(() => {
    if (!findById(filterdNavs, selected)) setSelected(firstLeafId(filterdNavs));
  }, [filterdNavs, selected]);

  const item = React.useMemo(() => findById(filterdNavs, selected), [filterdNavs, selected]);


  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem("sb-collapsed") === "1";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem("sb-collapsed", next ? "1" : "0");
      } catch {}
      return next;
    });
  }, []);

  const handleSelect = React.useCallback(
    (id: string) => {
      setSelected(id);
      const it = findById(filterdNavs, id);
      if (!it) return;
      const isNarrow = typeof window !== "undefined" && window.innerWidth < 1100;
      if (it.autocollapse && isNarrow) {
        setCollapsed(true);
        try {
          localStorage.setItem("sb-collapsed", "1");
        } catch {}
      }
    },
    [filterdNavs]
  );

  if (permissionsLoading) {
    return <div className="page layout">Cargando permisos...</div>;
  }

  return (
    <div className={`workspace layout ${collapsed ? "is-collapsed" : ""}`}>
      <Sidebar selected={selected} onSelect={handleSelect} user={user} collapsed={collapsed} onToggle={toggleCollapsed} sections={SECTIONS} />
      <main className="workspace-main">
        <div className="workspace-stage">
          <HeaderPrincipal item={item} toogleTheme={toggle} theme={theme} user={auth.account} logOut={auth.signOut}/>
          <div className="workspace-body">
            <AppRoutes/>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GraphServicesGate>
        <Shell />
      </GraphServicesGate>
    </AuthProvider>
  );
}

function GraphServicesGate({ children }: { children: React.ReactNode }) {
  const { ready, account } = useAuth();
  if (!ready || !account) return <>{children}</>;
  return <GraphServicesProvider>{children}</GraphServicesProvider>;
}
