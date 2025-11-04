export interface Lote {
  secuencia: number;
  empresa: number;
  ano: number;
  mes_nombre: string;
  lote: number;
  consecutivo: number;
  ajuste: string;
  fechaenvio: string;
  accion: string;
  sucursalpila: string | null;
  notas: string | null;
  respuesta_xml: string | null;
  tracking_id: string | null;
  candado: string;
  token: string | null;
}

export interface LotesResponse {
  items: Lote[];
  first: { $ref: string };
  next?: { $ref: string };
  prev?: { $ref: string };
}
