import type { GetAllOpts } from "../../../Models/Commons";

export function buildTiendasFilter(params: {s: string; zona: string; }): GetAllOpts {
  const { s, zona } = params;

  const filters: string[] = [];


  if (s) {
    filters.push(`fields/Title eq '${s}'`);
  }

  if (zona) {
    filters.push(`fields/Zona eq '${zona}'`);
  }

  console.log(filters)
  return {
    filter: filters.join(" and "),
    top: 2000,
  };
}