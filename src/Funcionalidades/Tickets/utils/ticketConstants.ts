export const TIENDAS_GROUP_ID = "e06961ff-6886-450d-a97f-48c3c3a55233";

export const horasPorANS: Record<string, number> = {
  "ANS 1": 5,
  "ANS 2": 81,
  "ANS 3": 135,
};

export const ESTADO_EN_ATENCION = "En Atencion";
export const ESTADO_FUERA_TIEMPO = "Fuera de tiempo";
export const ESTADO_PENDIENTE_APROBACION = "Pendiente aprobacion";
export const ESTADO_CERRADO = "Cerrado";
export const ESTADO_CERRADO_FUERA_TIEMPO = "Cerrado fuera de tiempo";
export const ESTADO_NO_APROBADO = "Cerrado - No aprobado";

export function normalizeStatus(value?: string | null): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function shouldExcludeTicketFromMetrics(status?: string | null): boolean {
  const normalized = normalizeStatus(status);

  return (
    normalized === normalizeStatus(ESTADO_PENDIENTE_APROBACION) ||
    normalized === normalizeStatus(ESTADO_NO_APROBADO)
  );
}
