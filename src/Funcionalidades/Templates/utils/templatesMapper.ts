import type { Plantillas } from "../../../Models/Plantilla";


export function mapFormToPlantillaPayload(state: Plantillas): Plantillas {
  return {
    CamposPlantilla: state.CamposPlantilla,
    Title: state.Title,
  };
}