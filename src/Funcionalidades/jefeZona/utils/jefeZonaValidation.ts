import type { jefeZona, JefeZonaErrors } from "../../../Models/TiendasZonas";


export function validateJefeZona(state: jefeZona): JefeZonaErrors {
  const errors: JefeZonaErrors = {};

  if (!state.Title?.trim()) {
    errors.Title = "Ingresa el nombre del jefe de zona.";
  }

  if (!state.Correo?.trim()) {
    errors.Correo = "Ingresa el correo del jefe de zona.";
  }

  return errors;
}

export function isJefeZonaValid(errors: JefeZonaErrors): boolean {
  return Object.keys(errors).length === 0;
}
