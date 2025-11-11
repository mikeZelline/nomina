import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Table,
  TableModule,
  TableRowSelectEvent,
  TableRowUnSelectEvent
} from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ComprobanteDian } from '@shared/models/comprobante-dian.interface';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { CuneModalComponent } from '@app/components/cune-modal/cune-modal.component';
import { ComprobantesDianService } from '@shared/services/comprobantes-dian.service';
import { TableRowExpandEvent, TableRowCollapseEvent } from 'primeng/table';

@Component({
  selector: 'app-prime-comprobantes-table',
  standalone: true,
  imports: [
    CommonModule,
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
export class PrimeComprobantesTableComponent implements AfterViewInit, OnDestroy {
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

  private readonly comprobantesService = inject(ComprobantesDianService);
  private readonly mediaQuery = window.matchMedia('(max-width: 768px)');
  private readonly mediaQueryListener = (event: MediaQueryListEvent): void =>
    this.isMobile.set(event.matches);

  readonly isMobile = signal(this.mediaQuery.matches);
  readonly tableStyles = computed(() =>
    this.isMobile() ? { minWidth: '100%' } : { minWidth: '120rem' }
  );
  readonly isScrollable = computed(() => !this.isMobile());

  constructor() {
    effect(() => {
      this.selectedComprobanteModel = this.selectedComprobante();
    });
    this.mediaQuery.addEventListener('change', this.mediaQueryListener);
  }

  ngOnDestroy(): void {
    this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
  }

  onRowExpand(event: TableRowExpandEvent): void {
    const data = Array.isArray(event.data) ? event.data[0] : event.data;
    if (!data) {
      return;
    }
    this.expandedRows.update((rows) => ({
      ...rows,
      [data.secuencia]: true
    }));
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
}

