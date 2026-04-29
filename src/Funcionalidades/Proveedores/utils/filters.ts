import type { GetAllOpts } from "../../../Models/Commons";

export function buildProveedoresFilter(params: {s: string; }): GetAllOpts {
  const { s, } = params;

  const filters: string[] = [];


  if (s) {
    filters.push(`startswith(fields/Title, '${s}')`);
  }

  console.log(filters)
  return {
    filter: filters.join(" and "),
    top: 2000,
  };
}