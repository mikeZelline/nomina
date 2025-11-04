import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Comprobante } from '@shared/models/comprobante.interface';
import { ParametrosNomina } from '@shared/models/parametros-nomina.interface';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NominaService {
  private readonly apiUrl = `${environment.apiBaseUrl}/nomina`;

  constructor(private http: HttpClient) {}

  getComprobantes(parametros: ParametrosNomina) {
    const url = `${this.apiUrl}/comprobantes`;
    // TODO: Implementar cuando la API esté lista
    return this.http.get<Comprobante[]>(url, { params: parametros as any });
  }

  eliminarComprobante(id: string) {
    const url = `${this.apiUrl}/comprobantes/${id}`;
    // TODO: Implementar cuando la API esté lista
    return this.http.delete(url);
  }

  procesarNomina(comprobantes: Comprobante[]) {
    const url = `${this.apiUrl}/procesar`;
    // TODO: Implementar cuando la API esté lista
    return this.http.post(url, { comprobantes });
  }
}
