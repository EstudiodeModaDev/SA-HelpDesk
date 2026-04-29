import type { Log, logErrors } from "../../../Models/Log";

export function validateDocumentacionForm(state: Log): logErrors {
  const errors: logErrors = {};
  const texto = (state.Descripcion ?? "").trim();

  if (!texto) {
    errors.Descripcion = "Por favor escriba la documentación.";
  } 

  return errors;
}

export function isFormValid(errors: logErrors): boolean {
  return Object.keys(errors).length === 0;
}