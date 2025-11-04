import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ComprobantesDianResponse } from '@shared/models/comprobante-dian.interface';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComprobantesDianService {
  private readonly apiBaseUrl = `${environment.apiBaseUrl}comprobantesdian/v1/empresa/`;

  constructor(private http: HttpClient) {}

  getComprobantesBySecuencia(
    secuencia: number, 
    codigoempleado?: string, 
    nombre?: string
  ): Observable<ComprobantesDianResponse> {
    let requestUrl = `${this.apiBaseUrl}?empresa_id=${secuencia}`;
    
    if (codigoempleado) {
      requestUrl += `&codigoempleado=${encodeURIComponent(codigoempleado)}`;
    }
    
    if (nombre) {
      requestUrl += `&nombre=${encodeURIComponent(nombre)}`;
    }
    
    console.log("Calling:", requestUrl);
    
    return this.http.get<ComprobantesDianResponse>(requestUrl).pipe(
      tap(response => console.log("Server response:", response))
    );
  }

  getComprobantesByUrl(url: string): Observable<ComprobantesDianResponse> {
    console.log("Calling:", url);
    
    return this.http.get<ComprobantesDianResponse>(url).pipe(
      tap(response => console.log("Server response:", response))
    );
  }
}
