export interface Empresa {
  secuencia: number;
  codigo: number;
  nit: number;
  nombre: string;
}

export interface EmpresasResponse {
  items: Empresa[];
  first: { $ref: string };
  next?: { $ref: string };
  prev?: { $ref: string };
}
