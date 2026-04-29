import type { TiendaZona, TiendaZonaErrors } from "../../../Models/TiendasZonas";


export function validateTiendaZona(state: TiendaZona): TiendaZonaErrors {
  const errors: TiendaZonaErrors = {};

  if (!state.Title?.trim()) {
    errors.Title = "Ingresa el nombre del espacio completo.";
  }

  if (!state.Zona?.trim()) {
    errors.Zona = "Seleccione la zona del espacio.";
  } 

  return errors;
}

export function isTiendaZonaValid(errors: TiendaZonaErrors): boolean {
  return Object.keys(errors).length === 0;
}