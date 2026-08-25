import * as XLSX from "xlsx";
import type * as ExcelJS from "exceljs";
import type { Categoria, SubCategoria } from "../../../Models/Categorias";
import type { TiendaZona } from "../../../Models/TiendasZonas";
import type { Proveedor } from "../../../Models/Proveedores";
import { norm } from "../../../utils/Commons";

export const TICKETS_TEMPLATE_HEADERS = [
  "Tienda o espacio fisico",
  "Categoria",
  "Subcategoria",
  "Descripcion",
  "Nombre solicitante",
  "Correo solicitante",
  "Proveedor",
] as const;

export type TicketDraftField =
  | "title"
  | "categoria"
  | "subcategoria"
  | "descripcion"
  | "nombreSolicitante"
  | "correoSolicitante"
  | "proveedor"

export type TicketDraft = Record<TicketDraftField, string>;

const HEADER_ALIASES: Record<TicketDraftField, string[]> = {
  title: ["tienda o espacio fisico", "espacio fisico", "tienda", "espacio"],
  categoria: ["categoria"],
  subcategoria: ["subcategoria", "sub categoria"],
  descripcion: ["descripcion"],
  nombreSolicitante: ["nombre solicitante", "solicitante"],
  correoSolicitante: ["correo solicitante", "correo del solicitante", "email solicitante"],
  proveedor: ["proveedor"],
};

function normalizeHeader(value: string): string {
  return norm(value).toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function getCell(row: Record<string, unknown>, aliases: string[]): string {
  for (const [key, value] of Object.entries(row)) {
    if (aliases.includes(normalizeHeader(key))) return String(value ?? "").trim();
  }
  return "";
}

export function mapRowToDraft(row: Record<string, unknown>): TicketDraft {
  const draft = {} as TicketDraft;
  (Object.keys(HEADER_ALIASES) as TicketDraftField[]).forEach((field) => {
    draft[field] = getCell(row, HEADER_ALIASES[field]);
  });
  return draft;
}

function isRowEmpty(row: Record<string, unknown>): boolean {
  return Object.values(row).every((v) => String(v ?? "").trim() === "");
}

export type ParsedTicketRow = {
  rowNumber: number;
  draft: TicketDraft;
};

export async function parseTicketsExcelFile(file: File): Promise<ParsedTicketRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });

  return rows
    .filter((raw) => !isRowEmpty(raw))
    .map((raw, index) => ({ rowNumber: index + 2, draft: mapRowToDraft(raw) }));
}

export function findCategoriaByTitle(categorias: Categoria[], text: string): Categoria | undefined {
  const target = norm(text).toLowerCase();
  if (!target) return undefined;
  return categorias.find((c) => norm(c.Title).toLowerCase() === target);
}

export function findSubcategoriaByTitle(
  subcategorias: SubCategoria[],
  categoriaId: string,
  text: string
): SubCategoria | undefined {
  const target = norm(text).toLowerCase();
  if (!target) return undefined;
  return subcategorias.find(
    (sub) => String(sub.Id_Categoria) === String(categoriaId) && norm(sub.Title).toLowerCase() === target
  );
}

/* =========================================================
   PLANTILLA DESCARGABLE (con desplegables en cascada)
   ========================================================= */

const TEMPLATE_DATA_ROWS = 500;

function columnLetter(col: number): string {
  let n = col;
  let letters = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter((v) => v.trim() !== ""))].sort((a, b) => a.localeCompare(b, "es"));
}

function listValidation(formula: string): ExcelJS.DataValidation {
  return {
    type: "list",
    allowBlank: true,
    showErrorMessage: true,
    errorStyle: "warning",
    errorTitle: "Valor fuera de la lista",
    error: "Selecciona un valor de la lista para evitar errores al procesar el archivo.",
    formulae: [formula],
  };
}

export async function buildTicketsTemplateWorkbook(
  categorias: Categoria[],
  subcategorias: SubCategoria[],
  tiendas: TiendaZona[],
  proveedores: Proveedor[]
): Promise<ExcelJS.Workbook> {
  const ExcelJSRuntime = await import("exceljs");
  const wb = new ExcelJSRuntime.Workbook();

  const categoriasOrdenadas = [...categorias].sort((a, b) => a.Title.localeCompare(b.Title, "es"));
  const subcategoriasPorCategoria = categoriasOrdenadas.map((cat) =>
    uniqueSorted(
      subcategorias.filter((s) => String(s.Id_Categoria) === String(cat.ID)).map((s) => s.Title)
    )
  );
  const tiendasOrdenadas = uniqueSorted(tiendas.map((t) => t.Title));
  const proveedoresOrdenados = uniqueSorted(proveedores.map((p) => p.Title));

  // La hoja a diligenciar se crea primero para que quede como la hoja activa/visible
  // al abrir el archivo (las hojas de soporte, ocultas, no pueden ser la hoja activa).
  const plantilla = wb.addWorksheet("Plantilla");
  plantilla.columns = TICKETS_TEMPLATE_HEADERS.map((header) => ({ header, key: header, width: 30 }));

  // ---- Hoja oculta con las listas fuente de los desplegables ----
  const listas = wb.addWorksheet("Listas", { state: "hidden" });

  categoriasOrdenadas.forEach((cat, i) => {
    listas.getCell(i + 1, 1).value = cat.Title;
  });

  subcategoriasPorCategoria.forEach((subs, catIndex) => {
    const col = catIndex + 2;
    (subs.length ? subs : [""]).forEach((title, rowIdx) => {
      listas.getCell(rowIdx + 1, col).value = title;
    });
  });

  const tiendaCol = categoriasOrdenadas.length + 2;
  const proveedorCol = tiendaCol + 1;
  (tiendasOrdenadas.length ? tiendasOrdenadas : [""]).forEach((title, i) => {
    listas.getCell(i + 1, tiendaCol).value = title;
  });
  (proveedoresOrdenados.length ? proveedoresOrdenados : [""]).forEach((title, i) => {
    listas.getCell(i + 1, proveedorCol).value = title;
  });

  const rangeRef = (col: number, count: number) => {
    const letter = columnLetter(col);
    const rows = Math.max(count, 1);
    return `'${listas.name}'!$${letter}$1:$${letter}$${rows}`;
  };

  wb.definedNames.add(rangeRef(1, categoriasOrdenadas.length), "Categorias");
  wb.definedNames.add(rangeRef(tiendaCol, tiendasOrdenadas.length), "Tiendas");
  wb.definedNames.add(rangeRef(proveedorCol, proveedoresOrdenados.length), "Proveedores");

  categoriasOrdenadas.forEach((_cat, i) => {
    wb.definedNames.add(rangeRef(i + 2, subcategoriasPorCategoria[i].length), `CAT_${i + 1}`);
  });

  // ---- Hoja oculta de referencia (categoria/subcategoria validas hoy) ----
  const catById = new Map(categorias.map((c) => [String(c.ID), c]));
  const catalogoRows = subcategorias
    .map((sub) => ({
      Categoria: catById.get(String(sub.Id_Categoria))?.Title ?? "",
      Subcategoria: sub.Title,
    }))
    .filter((r) => r.Categoria)
    .sort(
      (a, b) => a.Categoria.localeCompare(b.Categoria, "es") || a.Subcategoria.localeCompare(b.Subcategoria, "es")
    );

  const referencia = wb.addWorksheet("Categorias validas", { state: "hidden" });
  referencia.columns = [
    { header: "Categoria", key: "Categoria", width: 32 },
    { header: "Subcategoria", key: "Subcategoria", width: 32 },
  ];
  referencia.addRows(catalogoRows);

  // ---- Desplegables de la hoja a diligenciar ----
  const colOf = (header: (typeof TICKETS_TEMPLATE_HEADERS)[number]) =>
    TICKETS_TEMPLATE_HEADERS.indexOf(header) + 1;

  const tiendaColIdx = colOf("Tienda o espacio fisico");
  const categoriaColIdx = colOf("Categoria");
  const subcategoriaColIdx = colOf("Subcategoria");
  const proveedorColIdx = colOf("Proveedor");

  const tiendaValidation = listValidation("Tiendas");
  const categoriaValidation = listValidation("Categorias");
  const subcategoriaValidation = listValidation(
    `INDIRECT("CAT_"&MATCH($${columnLetter(categoriaColIdx)}2,Categorias,0))`
  );
  const proveedorValidation = listValidation("Proveedores");

  const lastRow = TEMPLATE_DATA_ROWS + 1;
  const columnRange = (col: number) => `${columnLetter(col)}2:${columnLetter(col)}${lastRow}`;

  // Se añade una sola validacion por rango (en vez de celda por celda) para que ExcelJS
  // no la fragmente en bloques sqref superpuestos al optimizar el archivo de salida.
  const dataValidations = (plantilla as unknown as {
    dataValidations: { add(address: string, validation: ExcelJS.DataValidation): void };
  }).dataValidations;

  dataValidations.add(columnRange(tiendaColIdx), tiendaValidation);
  dataValidations.add(columnRange(categoriaColIdx), categoriaValidation);
  dataValidations.add(columnRange(subcategoriaColIdx), subcategoriaValidation);
  dataValidations.add(columnRange(proveedorColIdx), proveedorValidation);

  plantilla.views = [{ state: "frozen", ySplit: 1 }];

  return wb;
}

export async function downloadTicketsTemplate(
  categorias: Categoria[],
  subcategorias: SubCategoria[],
  tiendas: TiendaZona[],
  proveedores: Proveedor[],
  fileName = "Plantilla Carga Masiva Tickets.xlsx"
): Promise<void> {
  const wb = await buildTicketsTemplateWorkbook(categorias, subcategorias, tiendas, proveedores);
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
