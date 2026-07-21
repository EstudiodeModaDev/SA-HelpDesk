import type { UserOption } from "../../../Models/Commons";
import type { jefeZona } from "../../../Models/TiendasZonas";

export function mapJefesZonaToOptions(list: jefeZona[]): {value: string; label: string}[] {
  return (list ?? [])
    .map((u) => {
      const nombre = String(u.Title ?? "—").trim();
      const id = String(u.Id ?? "").trim();

      return {
        value: id,
        label: nombre,
      } as UserOption;
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}