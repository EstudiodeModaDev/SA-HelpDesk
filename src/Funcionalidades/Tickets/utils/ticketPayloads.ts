import type { Ticket } from "../../../Models/Tickets";
import type { TZDate } from "@date-fns/tz";
import { toGraphDateTime } from "../../../utils/Date";
import { ESTADO_EN_ATENCION, ESTADO_PENDIENTE_APROBACION } from "./ticketConstants";
import { pickTecnicoConMenosCasos } from "./ticketAssignment";
import type { UsuariosSPService } from "../../../services/Usuarios.service";
import type { ApprovalTarget } from "./ticketApproval";


export async function buildNuevoTicketPayload(
  state: Ticket,
  ans: string,
  apertura: Date,
  solucion: TZDate | Date | null,
  usuarios: UsuariosSPService,
  options?: { requireApproval?: boolean; approvalTarget?: ApprovalTarget | null }
): Promise<Ticket> {
  const requireApproval = Boolean(options?.requireApproval);
  const approvalTarget = options?.approvalTarget ?? null;
  const resolutor = requireApproval ? null : await pickTecnicoConMenosCasos(usuarios);

  const payload: Ticket = {
        Title: state.Title,
    Descripcion: state.Descripcion,
    FechaApertura: toGraphDateTime(apertura),
    TiempoSolucion: requireApproval ? null : toGraphDateTime(solucion as any),
    Categoria: state.Categoria,
    SubCategoria: state.SubCategoria,
    Nombreresolutor: resolutor?.Title ?? "",
    Correoresolutor: resolutor?.Correo ?? "",
    Observador: requireApproval ? approvalTarget?.jefeZona ?? "" : state.Observador ?? "",
    CorreoObservador: requireApproval ? approvalTarget?.correoJefeZona ?? "" : state.CorreoObservador ?? "",
    Solicitante: state.Solicitante,
    CorreoSolicitante: state.CorreoSolicitante,
    Estadodesolicitud: requireApproval ? ESTADO_PENDIENTE_APROBACION : ESTADO_EN_ATENCION,
    ANS: ans,
    id_Categoria: state.id_Categoria,
    Id_Subcategoria: state.Id_Subcategoria,
    UltimaActualizacion: toGraphDateTime(new Date()) ?? null,
    IdCasoPadre: state.IdCasoPadre
  }

  console.log(payload)

  return payload;
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
    Solicitante: params.solicitante?.name,
    CorreoSolicitante: params.solicitante?.email,
    Estadodesolicitud: ESTADO_EN_ATENCION,
    id_Categoria: "",
    Id_Subcategoria: "",
    UltimaActualizacion: toGraphDateTime(new Date()) ?? null
  };
}
