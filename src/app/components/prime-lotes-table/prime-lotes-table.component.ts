import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, ViewChild, input, output } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Lote } from '@shared/models/lote.interface';


@Component({
  selector: 'app-prime-lotes-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './prime-lotes-table.component.html',
  styleUrls: ['./prime-lotes-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrimeLotesTableComponent {
  @ViewChild('dt') table?: Table;

  lotes = input.required<Lote[]>();
  rows = input(10);
  rowsPerPageOptions = input<number[]>([10, 25, 50]);
  paginator = input(true);
  loading = input(false);

  filterChange = output<{ ano?: number; mes?: number }>();
  actionCrear = output<void>();
  actionClonar = output<Lote>();
  actionEliminar = output<Lote>();
  candadoChange = output<{ lote: Lote; candado: string; oldCandado: string }>();
  rowSelect = output<Lote>();
  rowUnselect = output<Lote>();

  selectedLote: Lote | null = null;

  protected readonly mesOptions: Array<{ label: string; value: number }> = [
    { label: 'ENERO', value: 1 },
    { label: 'FEBRERO', value: 2 },
    { label: 'MARZO', value: 3 },
    { label: 'ABRIL', value: 4 },
    { label: 'MAYO', value: 5 },
    { label: 'JUNIO', value: 6 },
    { label: 'JULIO', value: 7 },
    { label: 'AGOSTO', value: 8 },
    { label: 'SEPTIEMBRE', value: 9 },
    { label: 'OCTUBRE', value: 10 },
    { label: 'NOVIEMBRE', value: 11 },
    { label: 'DICIEMBRE', value: 12 }
  ];

  private anoFilterValue: number | null = null;
  private mesFilterValue: number | null = null;

  get anoFilterDisplay(): number | null {
    return this.anoFilterValue;
  }

  get mesFilterDisplay(): number | null {
    return this.mesFilterValue;
  }

  onGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.table?.filterGlobal(value, 'contains');
  }

  onAnoFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.anoFilterValue = value ? Number(value) : null;
    this.emitFilters();
  }

  onMesSelectChange(value: string | number | null): void {
    if (value === '' || value === null) {
      this.mesFilterValue = null;
    } else {
      this.mesFilterValue = Number(value);
    }
    this.emitFilters();
  }

  onCrear(): void {
    this.actionCrear.emit();
  }

  onClonar(lote: Lote): void {
    this.actionClonar.emit(lote);
  }

  onEliminar(lote: Lote): void {
    this.actionEliminar.emit(lote);
  }

  onCandadoChange(lote: Lote, value: string): void {
    const oldValue = lote.candado;
    if (value === oldValue) {
      return;
    }
    this.candadoChange.emit({ lote, candado: value, oldCandado: oldValue });
  }

  onRowSelect(event: any): void {
    const lote = event?.data as Lote | undefined;
    if (!lote) {
      return;
    }
    this.selectedLote = lote;
    this.rowSelect.emit(lote);
  }

  onRowUnselect(event: any): void {
    const lote = event?.data as Lote | undefined;
    this.selectedLote = null;
    if (lote) {
      this.rowUnselect.emit(lote);
    }
  }

  getMesFormateado(nombre: string): string {
    return nombre?.toUpperCase() || '';
  }

  getProcedimiento(codigo: string): string {
    const map: Record<string, string> = {
      NINM: 'Normal Mes',
      NIAM: 'Ajuste Modificación',
      NIAE: 'Ajuste Eliminación',
      NINC: 'Novedad Contractual',
      NINT: 'Normal Tardía',
      NINR: 'Normal Rechazado'
    };
    return map[codigo] || 'Normal Mes';
  }

  private emitFilters(): void {
    const payload: { ano?: number; mes?: number } = {};

    if (this.anoFilterValue) {
      payload.ano = this.anoFilterValue;
    }

    if (this.mesFilterValue) {
      payload.mes = this.mesFilterValue;
    }

    this.filterChange.emit(payload);
  }
}

