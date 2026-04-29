import type { FormFranquinciasError, Franquicias } from "../../../Models/Usuarios";


export function validateFranquicia(state: Franquicias): FormFranquinciasError {
  const errors: FormFranquinciasError = {};

  if (!state.Title?.trim()) {
    errors.Title = "Ingresa el nombre de la franquicia.";
  }

  if (!state.Correo?.trim()) {
    errors.Correo = "Ingresa el correo.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.Correo)) {
    errors.Correo = "Correo inválido.";
  }

  if (!state.Celular?.trim()) {
    errors.Celular = "Ingresa el celular.";
  }

  if (!state.Ciudad?.trim()) {
    errors.Ciudad = "Ingresa la ciudad.";
  }

  return errors;
}

export function isFranquiciaValid(errors: FormFranquinciasError): boolean {
  return Object.keys(errors).length === 0;
}