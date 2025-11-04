import { Component, input, output, signal } from '@angular/core';
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
export class LotesRowsComponent {
  lotes = input.required<Lote[]>();
  
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
}
