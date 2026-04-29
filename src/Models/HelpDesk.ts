export type TicketHelpdesk = {
  ID?: string;
  Nombreresolutor?: string;
  IdResolutor?: string;
  Solicitante?: string;
  Title?: string; //Asunto
  FechaApertura?: string; // "dd/mm/yyyy hh:mm"
  TiempoSolucion?: string;   // "dd/mm/yyyy hh:mm"
  Estadodesolicitud?: string;
  Observador?: string;
  Descripcion?: string;
  Categoria?: string;
  SubCategoria?: string;
  SubSubCategoria?: string;
  Fuente?: string;
  Correoresolutor?: string;
  CorreoSolicitante?: string;
  IdCasoPadre?: string;
  ANS?: string;
  CorreoObservador?: string;
};

export type LogHelpdesk = {
    Id?: string;
    Title: string; //Id caso
    Descripcion: string;
    Tipo_de_accion: string;
    Actor: string;
    CorreoActor: string;
    Created?: string;
};

export type FormState = {
  solicitante: string;
  correoSolicitante: string;
  usarFechaApertura: boolean;
  fechaApertura: string | null; // YYYY-MM-DD
  fuente: string;
  motivo: string;
  descripcion: string;
  categoria: string;
  subcategoria: string;
  articulo: string;
  archivo: File | null;
  ANS?: string;
};

export type FormErrors = Partial<Record<keyof FormState, string>>;
