import type { UserOption } from "../../../Models/Commons";
import type { Proveedor } from "../../../Models/Proveedores";

export function mapProveedoresToOptions(list: Proveedor[]): {value: string; label: string}[] {
  return (list ?? [])
    .map((u) => {
      const nombre = String(u.Title ?? "—").trim();
      const correo = String(u.correoProveedor ?? "").trim();

      return {
        value: correo,
        label: nombre,
      } as UserOption;
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}