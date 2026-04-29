import type { AccountInfo } from "@azure/msal-browser";
import type { MenuItem, } from "../../App";
import type { Theme } from "../../Funcionalidades/Theme";
import "../../App.css";

type Props = {
  item: MenuItem | undefined;
  toogleTheme: () => void;
  theme: Theme;
  logOut: () => void;
  user: AccountInfo | null;
};

export default function HeaderPrincipal({ item, toogleTheme, theme, logOut }: Props) {
  return (
    <header className="workspace-topbar">
      <div className="workspace-topbar__left">
        <h1 className="workspace-topbar__title">{item?.label ?? "Panel"}</h1>
      </div>

      <div className="workspace-topbar__actions">
        <button className="btn btn-transparent-final btn-s" onClick={toogleTheme} aria-label={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}>
          {theme === "dark" ? "Noche" : "Claro"}
        </button>
        <button className="btn btn-secondary-final btn-s" onClick={() => logOut()} aria-label="Cerrar sesiÃ³n">
          Salir
        </button>
      </div>
    </header>
  );
}
