import type { UserOption } from "../../../Models/Commons";
import type { TiendaZona } from "../../../Models/TiendasZonas";

export function mapTiendaZonaToOptions(list: TiendaZona[]): {value: string; label: string}[] {
  return (list ?? [])
    .map((u) => {
      const nombre = String(u.Title ?? "—").trim();
      const Zona = String(u.Zona ?? "").trim();

      return {
        value: Zona,
        label: nombre,
      } as UserOption;
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}