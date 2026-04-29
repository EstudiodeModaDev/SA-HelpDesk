import type { UserOption } from "../../../Models/Commons";
import type { UsuariosSP } from "../../../Models/Usuarios";

export function mapUsuariosToOptions(list: UsuariosSP[]): UserOption[] {
  return (list ?? [])
    .map((u) => {
      const nombre = String(u.Title ?? "—").trim();
      const correo = String(u.Correo ?? "").trim();
      const id = String((u as any).Id ?? "");
      const rol = String(u.Rol ?? "");

      return {
        value: correo || id,
        label: nombre,
        id,
        jobTitle: rol,
        email: correo || undefined,
      } as UserOption;
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}