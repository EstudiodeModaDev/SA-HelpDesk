import type { Archivo } from "./Attachments";

export type Log = {
    Id?: string;
    Title: string; //Id caso
    Descripcion: string;
    Tipo_de_accion: string;
    Actor: string;
    CorreoActor: string;
    Created?: string;
};

export type LogConAdjuntos = Log & {
  attachments: Archivo[];
};

export type logErrors = Partial<Record<keyof Log, string>>;