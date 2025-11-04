import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LotesResponse } from '@shared/models/lote.interface';
import { environment } from '@environments/environment';

export interface CreateLotePayload {
  empresa: number;
  ano: number;
  mes: number;
  accion: string;
  ajuste: string;
}

@Injectable({
  providedIn: 'root'
})
export class LotesService {
  private readonly apiBaseUrl = `${environment.apiBaseUrl}lotes/v1/empresa/`;

  constructor(private http: HttpClient) {}

  getLotesByEmpresa(secuencia: number, ano?: number, mes?: number): Observable<LotesResponse> {
    let requestUrl = `${this.apiBaseUrl}?secuencia=${secuencia}`;
    
    // Agregar parámetros de filtro si están presentes
    if (ano !== undefined && ano !== null) {
      requestUrl += `&ano=${ano}`;
    }
    if (mes !== undefined && mes !== null) {
      requestUrl += `&mes=${mes}`;
    }
    
    console.log("Calling:", requestUrl);
    
    return this.http.get<LotesResponse>(requestUrl).pipe(
      tap(response => console.log("Server response:", response))
    );
  }

  getLotesByUrl(url: string): Observable<LotesResponse> {
    console.log("Calling:", url);
    
    return this.http.get<LotesResponse>(url).pipe(
      tap(response => console.log("Server response:", response))
    );
  }

  createLote(empresa: number, ano: number, mes: number, accion: string): Observable<any> {
    const requestUrl = this.apiBaseUrl + "validar/";
    const payload: CreateLotePayload = {
      empresa: empresa,
      ano: ano,
      mes: mes,
      accion: accion,
      ajuste: 'N'
    };
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    console.log("Calling:", requestUrl);
    console.log("Payload:", payload);
    
    return this.http.post<any>(requestUrl, payload, { headers }).pipe(
      tap(response => console.log("Server response:", response))
    );
  }

  updateCandado(secuencia: number, candado: string): Observable<any> {
    const requestUrl = `${environment.apiBaseUrl}lotes/v1/lote/${secuencia}/candado/`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    const payload = { candado };
    
    console.log("Calling:", requestUrl);
    console.log("Payload:", payload);
    
    return this.http.put<any>(requestUrl, payload, { headers }).pipe(
      tap(response => console.log("Server response:", response))
    );
  }
}
