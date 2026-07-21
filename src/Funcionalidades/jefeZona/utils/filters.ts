import type { GetAllOpts } from "../../../Models/Commons";

export function buildJefeZonaFilter(params: {s: string; }): GetAllOpts {
  const { s, } = params;

  const filters: string[] = [];


  if (s) {
    filters.push(`startswith(fields/Title, '${s}')`);
    filters.push(`startswith(fields/Correo, '${s}')`);
  }

  console.log(filters)
  return {
    filter: filters.join(" or "),
    top: 2000,
  };
}