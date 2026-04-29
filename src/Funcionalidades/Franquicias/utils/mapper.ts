import type { UserOption } from "../../../Models/Commons";
import type { Franquicias } from "../../../Models/Usuarios";


export function mapFranqToOptions(list: Franquicias[]): UserOption[] {
  return (list ?? [])
    .map((f) => {
      const nombre = String((f as any).Nombre1 ?? f.Title ?? "—");
      const correo = String(f.Correo ?? "").trim();
      const id = String((f as any).ID ?? (f as any).Id ?? correo ?? nombre);

      return {
        value: correo || id,
        label: nombre,
        id,
        email: correo || undefined,
        jobTitle: "Franquicia",
      } as UserOption;
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}