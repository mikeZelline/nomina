import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { FormsModule } from '@angular/forms';
import {
  Table,
  TableModule,
  TableRowSelectEvent,
  TableRowUnSelectEvent,
  TableRowExpandEvent,
  TableRowCollapseEvent
} from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ComprobanteDian } from '@shared/models/comprobante-dian.interface';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { CuneModalComponent } from '@app/components/cune-modal/cune-modal.component';
import { ComprobantesDianService } from '@shared/services/comprobantes-dian.service';

@Component({
  selector: 'app-prime-comprobantes-table',
  standalone: true,
  imports: [
    CommonModule,
    LayoutModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    RippleModule,
    PaginationComponent,
    CuneModalComponent
  ],
  templateUrl: './prime-comprobantes-table.component.html',
  styleUrls: ['./prime-comprobantes-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrimeComprobantesTableComponent {
  @ViewChild('dt') table?: Table;

  comprobantes = input.required<ComprobanteDian[]>();
  selectedComprobante = input<ComprobanteDian | null>(null);
  loading = input(false);
  comprobanteSelect = output<ComprobanteDian>();
  comprobantesChange = output<ComprobanteDian[]>();
  filterChange = output<{ codigoempleado?: string; nombre?: string }>();

  // Pagination state
  firstPageUrl = signal<string>('');
  nextPageUrl = signal<string | null>(null);
  prevPageUrl = signal<string | null>(null);
  currentPage = signal<number>(1);
  isLoading = signal<boolean>(false);

  // Filter state
  showFilters = signal<boolean>(false);
  codigoEmpleadoFilter = signal<string>('');
  nombreEmpleadoFilter = signal<string>('');

  expandedRows = signal<Record<string, boolean>>({});
  // CUNE modal state
  showCuneModal = signal<boolean>(false);
  selectedComprobanteForCune = signal<ComprobanteDian | null>(null);

  protected selectedComprobanteModel: ComprobanteDian | null = null;
  protected readonly tableStyle = signal<Record<string, string>>({});

  private readonly comprobantesService = inject(ComprobantesDianService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  constructor() {
    effect(() => {
      this.selectedComprobanteModel = this.selectedComprobante();
    });
    effect(() => {
      const breakpointSub = this.breakpointObserver
        .observe([Breakpoints.Handset])
        .subscribe((state) => {
          if (state.matches) {
            this.tableStyle.set({});
          } else {
            this.tableStyle.set({ 'min-width': '60rem' });
          }
        });

      return () => breakpointSub.unsubscribe();
    });
    effect(() => {
      const expanded = this.expandedRows();
      const available = new Set(
        this.comprobantes().map((comprobante) => String(comprobante.secuencia))
      );
      const filtered: Record<string, boolean> = {};
      for (const key of Object.keys(expanded)) {
        if (available.has(key)) {
          filtered[key] = true;
        }
      }
      if (!this.areRowStatesEqual(expanded, filtered)) {
        this.expandedRows.set(filtered);
      }
    }, { allowSignalWrites: true });
  }

  onRowExpand(event: TableRowExpandEvent): void {
    const data = Array.isArray(event.data) ? event.data[0] : event.data;
    if (!data) {
      return;
    }
    this.expandedRows.update((rows) => {
      if (rows[data.secuencia]) {
        return rows;
      }
      return {
        ...rows,
        [data.secuencia]: true
      };
    });
  }

  onRowCollapse(event: TableRowCollapseEvent): void {
    const data = Array.isArray(event.data) ? event.data[0] : event.data;
    if (!data) {
      return;
    }
    const { [data.secuencia]: _, ...rest } = this.expandedRows();
    this.expandedRows.set(rest);
  }

  ngAfterViewInit(): void {
    this.table?.resetScrollTop();
  }

  onRowSelect(event: TableRowSelectEvent<ComprobanteDian>): void {
    const comprobante = Array.isArray(event.data) ? event.data[0] : event.data;
    if (comprobante) {
      this.comprobanteSelect.emit(comprobante);
    }
  }

  onRowUnselect(event: TableRowUnSelectEvent<ComprobanteDian>): void {
    const comprobante = Array.isArray(event.data) ? event.data[0] : event.data;
    if (comprobante) {
      this.comprobanteSelect.emit(comprobante);
    }
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  onCodigoEmpleadoFilterInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.codigoEmpleadoFilter.set(value);
    if (value.trim().length === 0 || value.trim().length >= 3) {
      this.emitFilters();
    }
  }

  onNombreEmpleadoFilterInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.nombreEmpleadoFilter.set(value);
    if (value.trim().length === 0 || value.trim().length >= 3) {
      this.emitFilters();
    }
  }

  private emitFilters(): void {
    const filters: { codigoempleado?: string; nombre?: string } = {};
    const codigo = this.codigoEmpleadoFilter().trim();
    const nombre = this.nombreEmpleadoFilter().trim();

    if (codigo.length >= 3) {
      filters.codigoempleado = codigo;
    }

    if (nombre.length >= 3) {
      filters.nombre = nombre;
    }

    this.filterChange.emit(filters);
  }

  clearFilters(): void {
    this.codigoEmpleadoFilter.set('');
    this.nombreEmpleadoFilter.set('');
    this.table?.clear();
    this.emitFilters();
  }

  onCuneChange(comprobante: ComprobanteDian, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const updated = { ...comprobante, cune: inputElement.value };

    const currentComprobantes = [...this.comprobantes()];
    const index = currentComprobantes.findIndex(
      (item) => item.secuencia === updated.secuencia
    );

    if (index !== -1) {
      currentComprobantes[index] = updated;
      this.comprobantesChange.emit(currentComprobantes);
    }
  }

  onCuneDblClick(comprobante: ComprobanteDian, event: Event): void {
    event.stopPropagation();
    this.selectedComprobanteForCune.set(comprobante);
    this.showCuneModal.set(true);
  }

  onCloseCuneModal(): void {
    this.showCuneModal.set(false);
    this.selectedComprobanteForCune.set(null);
  }

  onSaveCune(data: { comprobante: ComprobanteDian; cune: string }): void {
    const current = [...this.comprobantes()];
    const index = current.findIndex(
      (item) => item.secuencia === data.comprobante.secuencia
    );
    if (index !== -1) {
      current[index] = { ...data.comprobante, cune: data.cune };
      this.comprobantesChange.emit(current);
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value ?? 0);
  }

  formatDate(date: string | undefined | null): string {
    if (!date) {
      return '-';
    }
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return '-';
    }
    return parsed.toLocaleDateString('es-CO');
  }

  // Pagination helpers
  goToFirstPage(): void {
    if (!this.firstPageUrl()) {
      return;
    }
    this.currentPage.set(1);
    this.loadComprobantesPage(this.firstPageUrl());
  }

  goToNextPage(): void {
    if (!this.nextPageUrl()) {
      return;
    }
    this.currentPage.update((value) => value + 1);
    this.loadComprobantesPage(this.nextPageUrl()!);
  }

  goToPrevPage(): void {
    if (!this.prevPageUrl()) {
      return;
    }
    this.currentPage.update((value) => Math.max(1, value - 1));
    this.loadComprobantesPage(this.prevPageUrl()!);
  }

  initializePagination(
    _secuencia: number,
    firstPage: string,
    nextPage?: string,
    prevPage?: string
  ): void {
    this.firstPageUrl.set(firstPage);
    this.nextPageUrl.set(nextPage ?? null);
    this.prevPageUrl.set(prevPage ?? null);
    this.currentPage.set(1);
  }

  private loadComprobantesPage(url: string): void {
    this.isLoading.set(true);
    this.comprobantesService.getComprobantesByUrl(url).subscribe({
      next: (response) => {
        this.firstPageUrl.set(response.first.$ref);
        this.nextPageUrl.set(response.next?.$ref ?? null);
        this.prevPageUrl.set(response.prev?.$ref ?? null);
        this.isLoading.set(false);
        this.comprobantesChange.emit(response.items);
      },
      error: (error) => {
        console.error('Error cargando página de comprobantes:', error);
        this.isLoading.set(false);
      }
    });
  }

  expandAllRows(): void {
    const expanded: Record<string, boolean> = {};
    for (const comprobante of this.comprobantes()) {
      expanded[comprobante.secuencia] = true;
    }
    this.expandedRows.set(expanded);
  }

  collapseAllRows(): void {
    this.expandedRows.set({});
  }

  private areRowStatesEqual(
    current: Record<string, boolean>,
    next: Record<string, boolean>
  ): boolean {
    const currentKeys = Object.keys(current);
    const nextKeys = Object.keys(next);
    if (currentKeys.length !== nextKeys.length) {
      return false;
    }
    for (const key of currentKeys) {
      if (!(key in next) || current[key] !== next[key]) {
        return false;
      }
    }
    return true;
  }

}
