export type Proveedor = {
  Id?: string
  Title: string
  correoProveedor: string;
}

export type ProveedorErrors = Partial<Record<keyof Proveedor, string>>;