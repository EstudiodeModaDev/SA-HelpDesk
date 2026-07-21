import type { TiendaZona, TiendaZonaErrors } from "../../../Models/TiendasZonas";


export function validateTiendaZona(state: TiendaZona): TiendaZonaErrors {
  const errors: TiendaZonaErrors = {};

  if (!state.Title?.trim()) {
    errors.Title = "Ingresa el nombre del espacio completo.";
  }

  if (!state.Zona?.trim()) {
    errors.Zona = "Seleccione la zona del espacio.";
  }

  if (!state.JefeZonaId?.trim() && !state.JefeZona?.trim()) {
    errors.JefeZonaId = "Selecciona el jefe de zona asociado.";
  }

  return errors;
}

export function isTiendaZonaValid(errors: TiendaZonaErrors): boolean {
  return Object.keys(errors).length === 0;
}
