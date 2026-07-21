export type TiendaZona = {
  Id?: string
  Title: string
  Zona: string;
  JefeZonaId?: string;
  JefeZona?: string;
}

export type TiendaZonaErrors = Partial<Record<keyof TiendaZona, string>>;

export type jefeZona = {
  Id?: string
  Title: string //Nombre
  Correo: string
  Activo: boolean
}

export type JefeZonaErrors = Partial<Record<keyof jefeZona, string>>;
