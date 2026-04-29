import type { FormNewUserErrors, UsuariosSP } from "../../../Models/Usuarios";


export function validateUsuario(state: UsuariosSP): FormNewUserErrors {
  const errors: FormNewUserErrors = {};

  if (!state.Title?.trim()) {
    errors.Title = "Ingresa el nombre completo.";
  }

  if (!state.Correo?.trim()) {
    errors.Correo = "Ingresa el correo.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.Correo)) {
    errors.Correo = "Correo inválido.";
  }

  return errors;
}

export function isUsuarioValid(errors: FormNewUserErrors): boolean {
  return Object.keys(errors).length === 0;
}