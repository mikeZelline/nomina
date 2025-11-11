import { Component, signal, computed, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '@app/components/header/header.component';
import { PrimeComprobantesTableComponent } from '@app/components/prime-comprobantes-table/prime-comprobantes-table.component';
import { ActionsComponent } from '@app/components/actions/actions.component';
import { NominaService } from '@shared/services/nomina.service';
import { ComprobantesDianService } from '@shared/services/comprobantes-dian.service';
import { ComprobanteDian } from '@shared/models/comprobante-dian.interface';
import { ParametrosNomina } from '@shared/models/parametros-nomina.interface';

@Component({
  selector: 'app-nominav2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    HeaderComponent,
    PrimeComprobantesTableComponent,
    ActionsComponent
  ],
  templateUrl: './nominav2.module.html',
  styles: [`
    .nomina-container {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
      overflow-x: hidden;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 100%;
    }

    .table-section h3 {
      color: var(--primary-color);
      margin-bottom: 15px;
      font-size: 18px;
      font-weight: 600;
    }

    /* Responsive para móviles */
    @media (max-width: 768px) {
      .nomina-container {
        padding: 10px;
        margin: 0;
        max-width: 100vw;
      }

      .main-content {
        gap: 15px;
      }

      .table-section h3 {
        font-size: 16px;
      }
    }
  `]
})
export class Nominav2Module implements AfterViewInit {
  parametros = signal<ParametrosNomina>({
    año: 2025,
    mes: 'SEPTIEMBRE',
    sucursalPila: '',
    procedimiento: 'Normal Mes',
    consecutivo: 1,
    lote: 257,
    enviados: 'Enviado'
  });

  comprobantes = signal<ComprobanteDian[]>([]);
  selectedComprobante = signal<ComprobanteDian | null>(null);
  totalProcesados = computed(() => {
    const comprobantes = this.comprobantes();
    // Si el primer comprobante tiene total_empleados, usarlo
    if (comprobantes.length > 0 && comprobantes[0].total_empleados !== undefined) {
      return comprobantes[0].total_empleados;
    }
    // Si no, devolver la longitud del array
    return comprobantes.length;
  });

  @ViewChild('comprobantesTable') comprobantesTableRef!: PrimeComprobantesTableComponent;
  @ViewChild('headerComponent') headerComponentRef!: any;

  meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  procedimientos = ['Normal Mes', 'Ajuste', 'Corrección'];
  estadosEnvio = ['Enviado', 'Pendiente', 'Error'];

  constructor(
    private nominaService: NominaService,
    private comprobantesDianService: ComprobantesDianService,
    private router: Router
  ) {
    // Ya no cargamos comprobantes aquí - se cargan desde el HeaderComponent
    // cuando se selecciona una empresa
  }

  onComprobanteSelect(comprobante: ComprobanteDian): void {
    this.selectedComprobante.set(comprobante);
  }

  onComprobantesChange(comprobantes: ComprobanteDian[]): void {
    this.comprobantes.set(comprobantes);
  }

  ngAfterViewInit(): void {
    // El componente ya está disponible, inicializar paginación si hay comprobantes
    if (this.comprobantes().length > 0 && this.comprobantesTableRef) {
      // La paginación se inicializará cuando se carguen los comprobantes
    }
  }

  onComprobantesPaginationChange(paginationInfo: any): void {
    if (this.comprobantesTableRef) {
      this.comprobantesTableRef.initializePagination(
        paginationInfo.secuencia,
        paginationInfo.firstPageUrl,
        paginationInfo.nextPageUrl,
        paginationInfo.prevPageUrl
      );
    }
  }

  onComprobantesFilterChange(filters: {codigoempleado?: string, nombre?: string}): void {
    // Pasar los filtros al header para que los use al cargar comprobantes
    if (this.headerComponentRef) {
      this.headerComponentRef.onComprobantesFilterChange(filters);
    }
  }

  onExportComprobantesExcel(): void {
    // Llamar al método de exportación del HeaderComponent
    if (this.headerComponentRef) {
      this.headerComponentRef.exportComprobantesToExcel();
    }
  }

  onBuscar(): void {
    // Implementar búsqueda
  }

  onMostrarTodos(): void {
    // No se carga comprobantes aquí - se maneja desde el header
    // Si es necesario recargar, se debe llamar al header
  }

  onEliminarComprobante(): void {
    if (this.selectedComprobante()) {
      // Implementar eliminación
    }
  }

  onProcesar(): void {
    // Implementar procesamiento
  }

  onGeneracionArchivos(): void {
    // Implementar generación de archivos
  }

  onCargueCune(): void {
    // Implementar carga de CUNE
  }

  onAceptar(): void {
    // Implementar acción de aceptar
  }

  onCancelar(): void {
    // Implementar acción de cancelar
  }

  onProfile(): void {
    // Implementar navegación a perfil de usuario
    // TODO: Implementar componente de perfil
  }

  onLogout(): void {
    // Limpiar datos de sesión y volver al login
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}

