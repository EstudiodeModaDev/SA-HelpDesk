export type TiendaZona = {
  Id?: string
  Title: string
  Zona: string;
}

export type TiendaZonaErrors = Partial<Record<keyof TiendaZona, string>>;