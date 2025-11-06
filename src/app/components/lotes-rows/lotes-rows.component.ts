import { Component, input, output, signal, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lote } from '@shared/models/lote.interface';
import { FilterInputComponent } from '@app/components/filter-input/filter-input.component';

@Component({
  selector: 'app-lotes-rows',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterInputComponent],
  templateUrl: './lotes-rows.component.html',
  styleUrl: './lotes-rows.component.css'
})
export class LotesRowsComponent implements AfterViewInit {
  lotes = input.required<Lote[]>();
  
  @ViewChild('createButton', { read: ElementRef }) createButtonRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('tableContainer', { read: ElementRef }) tableContainerRef?: ElementRef<HTMLDivElement>;
  
  // Outputs para comunicar filtros al componente padre
  filterChange = output<{ano?: number, mes?: number}>();
  
  // Outputs para comunicar acciones al componente padre
  actionCrear = output<void>();
  actionClonar = output<Lote>();
  actionEliminar = output<Lote>();
  candadoChange = output<{lote: Lote, candado: string, oldCandado: string}>();
  
  // Estado de filtros
  showFilters: boolean = false;
  anoFilter: number | null = null;
  mesFilter: string = "";

  meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  procedimientos = [
    { value: 'NINM', label: 'Normal Mes' },
    { value: 'NIAM', label: 'Ajuste Modificación' },
    { value: 'NIAE', label: 'Ajuste Eliminación' },
    { value: 'NINC', label: 'Novedad Contractual' },
    { value: 'NINT', label: 'Normal Tardía' },
    { value: 'NINR', label: 'Normal Rechazado' }
  ];
  
  estadosEnvio = [
    { value: 'S', label: 'Enviado' },
    { value: 'N', label: 'Cancelado' }
  ];

  // Métodos helper para formatear datos de lotes
  getProcedimiento(codigo: string): string {
    const procedimientosMap: { [key: string]: string } = {
      'NINM': 'Normal Mes',
      'NIAM': 'Ajuste Modificación',
      'NIAE': 'Ajuste Eliminación',
      'NINC': 'Novedad Contractual',
      'NINT': 'Normal Tardía',
      'NINR': 'Normal Rechazado'
    };
    return procedimientosMap[codigo] || 'Normal Mes';
  }

  onCandadoChange(lote: Lote, value: string): void {
    const oldCandado = lote.candado;
    this.candadoChange.emit({ lote, candado: value, oldCandado });
  }

  // Convertir mes de minúsculas a mayúsculas para el select
  getMesFormateado(mesNombre: string): string {
    const mesesMap: { [key: string]: string } = {
      'enero': 'ENERO',
      'febrero': 'FEBRERO', 
      'marzo': 'MARZO',
      'abril': 'ABRIL',
      'mayo': 'MAYO',
      'junio': 'JUNIO',
      'julio': 'JULIO',
      'agosto': 'AGOSTO',
      'septiembre': 'SEPTIEMBRE',
      'octubre': 'OCTUBRE',
      'noviembre': 'NOVIEMBRE',
      'diciembre': 'DICIEMBRE'
    };
    return mesesMap[mesNombre.toLowerCase()] || mesNombre.toUpperCase();
  }

  // Convertir nombre del mes a número (1-12)
  getMesNumber(mesNombre: string): number {
    const mesesMap: { [key: string]: number } = {
      'ENERO': 1,
      'FEBRERO': 2,
      'MARZO': 3,
      'ABRIL': 4,
      'MAYO': 5,
      'JUNIO': 6,
      'JULIO': 7,
      'AGOSTO': 8,
      'SEPTIEMBRE': 9,
      'OCTUBRE': 10,
      'NOVIEMBRE': 11,
      'DICIEMBRE': 12
    };
    return mesesMap[mesNombre] || 0;
  }

  // Métodos para manejar filtros
  toggleFilter(filterType: string): void {
    this.showFilters = !this.showFilters;
  }

  // Método para manejar el cambio del filtro de año
  onAnoFilterChangeValue(value: string): void {
    this.anoFilter = value && value.trim() !== '' ? parseInt(value, 10) || null : null;
    this.onAnoFilterChange();
  }

  // Método específico para el filtro de año (mínimo 4 dígitos)
  onAnoFilterChange(): void {

    const length = this.anoFilter?.toString().length ?? 0;
    // Solo incluir el filtro de año si tiene exactamente 4 dígitos
    if (length === 0 || length === 4) {
      this.onFilterChange();
    }

  }

  // Método general para otros filtros (se dispara siempre)
  onFilterChange(): void {
    const filters: {ano?: number, mes?: number} = {};
    
    // Solo incluir el filtro de año si tiene exactamente 4 dígitos
    if (this.anoFilter) {
      filters.ano = this.anoFilter;
    }
    
    // Siempre incluir el filtro de mes si existe
    if (this.mesFilter) {
      filters.mes = this.getMesNumber(this.mesFilter);
    }
    
    this.filterChange.emit(filters);
    
  }

  // Métodos para manejar acciones
  onCrear(): void {
    this.actionCrear.emit();
  }

  onClonar(lote: Lote): void {
    this.actionClonar.emit(lote);
  }

  onEliminar(lote: Lote): void {
    this.actionEliminar.emit(lote);
  }

  constructor() {
    // Effect para hacer scroll automático cuando no hay lotes
    effect(() => {
      const lotesCount = this.lotes().length;
      // Esperar a que las referencias estén disponibles
      if (lotesCount === 0) {
        setTimeout(() => {
          if (this.createButtonRef && this.tableContainerRef) {
            this.scrollToCreateButton();
          }
        }, 150);
      }
    });
  }

  ngAfterViewInit(): void {
    // Si no hay lotes al cargar el componente, hacer scroll
    if (this.lotes().length === 0) {
      setTimeout(() => {
        this.scrollToCreateButton();
      }, 150);
    }
  }

  private scrollToCreateButton(): void {
    if (!this.createButtonRef?.nativeElement || !this.tableContainerRef?.nativeElement) {
      return;
    }

    const button = this.createButtonRef.nativeElement;
    const container = this.tableContainerRef.nativeElement;
    
    // Calcular la posición del botón relativa al contenedor
    const buttonRect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Calcular el scroll necesario para centrar el botón horizontalmente
    const scrollLeft = buttonRect.left - containerRect.left + container.scrollLeft - (containerRect.width / 2) + (buttonRect.width / 2);
    
    // Hacer scroll suave al botón
    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth'
    });
  }
}
