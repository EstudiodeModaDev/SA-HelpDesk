import type { Proveedor, ProveedorErrors } from "../../../Models/Proveedores";


export function validateProveedor(state: Proveedor): ProveedorErrors {
  const errors: ProveedorErrors = {};

  if (!state.Title?.trim()) {
    errors.Title = "Ingresa el nombre del proveedor.";
  }

  if (!state.correoProveedor?.trim()) {
    errors.correoProveedor = "Ingrese el correo del proveedor.";
  } 

  return errors;
}

export function isProveedorValid(errors: ProveedorErrors): boolean {
  return Object.keys(errors).length === 0;
}