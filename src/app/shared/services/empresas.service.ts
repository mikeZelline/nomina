import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { EmpresasResponse } from '@shared/models/empresa.interface';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {
  private readonly apiUrl = `${environment.apiBaseUrl}empresas/v1/lista/`;

    constructor(private http: HttpClient) {}

  getEmpresas(url?: string): Observable<EmpresasResponse> {
    const requestUrl = url || this.apiUrl;

    console.log("Calling:", requestUrl);

    return this.http.get<EmpresasResponse>(requestUrl).pipe(
      tap(response => console.log("Server response:", response))
    );
  }

  searchEmpresas(nit?: string, nombre?: string): Observable<EmpresasResponse> { 
    let searchUrl = this.apiUrl;
    const params: string[] = [];

    if (nit && nit.trim()) {
      params.push(`nit=${encodeURIComponent(nit.trim())}`);
    }

    if (nombre && nombre.trim()) {
      params.push(`nombre=${encodeURIComponent(nombre.trim())}`);
    }

    if (params.length > 0) {
      searchUrl += '?' + params.join('&');
    }

    console.log("Calling:", searchUrl);

    return this.http.get<EmpresasResponse>(searchUrl).pipe(
      tap(response => console.log("Server response:", response))
    );
  }
}
