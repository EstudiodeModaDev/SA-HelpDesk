import type { CorreoErrors, correoState } from "../hooks/useProveedoresMailForm";


export function proveedorMailValidation(state: correoState): CorreoErrors {
  const errors: CorreoErrors = {};

  if (!state.asunto?.trim()) {
    errors.asunto = "Ingresa el asunto del correo.";
  }

  if (!state.correo?.trim()) {
    errors.correo = "Seleccione un proveedor.";
  } 

  if (!state.mensaje?.trim()) {
    errors.mensaje = "Escriba el cuerpo del correo.";
  } 

  return errors;
}

export function isCorreoValid(errors: CorreoErrors): boolean {
  return Object.keys(errors).length === 0;
}