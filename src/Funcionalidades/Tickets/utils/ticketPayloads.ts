import type { Ticket } from "../../../Models/Tickets";
import type { TZDate } from "@date-fns/tz";
import { toGraphDateTime } from "../../../utils/Date";
import { ESTADO_EN_ATENCION } from "./ticketConstants";
import { pickTecnicoConMenosCasos } from "./ticketAssignment";
import type { UsuariosSPService } from "../../../services/Usuarios.service";

export async function buildNuevoTicketPayload(state: Ticket, ans: string, apertura: Date, solucion: TZDate | Date | null, usuarios: UsuariosSPService): Promise<Ticket> {
  const resolutor = await pickTecnicoConMenosCasos(usuarios)
  return {
    Title: state.Title,
    Descripcion: state.Descripcion,
    FechaApertura: toGraphDateTime(apertura),
    TiempoSolucion: toGraphDateTime(solucion as any),
    Categoria: state.Categoria,
    SubCategoria: state.SubCategoria,
    Nombreresolutor: resolutor?.Title,
    Correoresolutor: resolutor?.Correo,
    Solicitante: state.Solicitante,
    CorreoSolicitante: state.CorreoSolicitante,
    Estadodesolicitud: ESTADO_EN_ATENCION,
    ANS: ans,
    id_Categoria: state.id_Categoria,
    Id_Subcategoria: state.Id_Subcategoria,
    UltimaActualizacion: toGraphDateTime(new Date()) ?? null,
    IdCasoPadre: state.IdCasoPadre
  };
}

export function buildNuevoUsuarioTicketPayload(
  params: {
    ans: string; 
    motivo: string; 
    descripcion: string; 
    resolutor?: { Title?: string; Correo?: string; Id?: string }; 
    solicitante?: { name?: string; email?: string };
    solucion: TZDate | Date | null}
): Ticket {
  return {
    Title: params.motivo,
    Descripcion: params.descripcion,
    FechaApertura: toGraphDateTime(new Date()),
    TiempoSolucion: toGraphDateTime(params.solucion as any),
    Nombreresolutor: params.resolutor?.Title,
    Correoresolutor: params.resolutor?.Correo,
    IdResolutor: params.resolutor?.Id,
    Solicitante: params.solicitante?.name,
    CorreoSolicitante: params.solicitante?.email,
    Estadodesolicitud: ESTADO_EN_ATENCION,
    id_Categoria: "",
    Id_Subcategoria: "",
    UltimaActualizacion: toGraphDateTime(new Date()) ?? null
  };
}