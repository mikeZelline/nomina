import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComprobanteDian } from '@shared/models/comprobante-dian.interface';
import { ComprobantesDianService } from '@shared/services/comprobantes-dian.service';
import { inject } from '@angular/core';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { FilterInputComponent } from '@app/components/filter-input/filter-input.component';
import { CuneModalComponent } from '@app/components/cune-modal/cune-modal.component';

@Component({
  selector: 'app-comprobantes-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, FilterInputComponent, CuneModalComponent],
  templateUrl: './comprobantes-table.component.html',
  styleUrl: './comprobantes-table.component.css'
})
export class ComprobantesTableComponent {
  comprobantes = input.required<ComprobanteDian[]>();
  selectedComprobante = input<ComprobanteDian | null>(null);
  comprobanteSelect = output<ComprobanteDian>();
  comprobantesChange = output<ComprobanteDian[]>();
  filterChange = output<{codigoempleado?: string, nombre?: string}>();
  
  // Servicio para paginación
  comprobantesService = inject(ComprobantesDianService);
  
  // Estado de paginación
  isLoading = signal<boolean>(false);
  firstPageUrl = signal<string>('');
  nextPageUrl = signal<string | null>(null);
  prevPageUrl = signal<string | null>(null);
  currentPage = signal<number>(1);
  currentSecuencia = signal<number | null>(null);
  
  // Estado de filtros
  showFilters = signal<boolean>(false);
  codigoEmpleadoFilter = signal<string>('');
  nombreEmpleadoFilter = signal<string>('');
  
  // Estado del modal CUNE
  showCuneModal = signal<boolean>(false);
  selectedComprobanteForCune = signal<ComprobanteDian | null>(null);

  onComprobanteClick(comprobante: ComprobanteDian): void {
    this.comprobanteSelect.emit(comprobante);
  }

  onCuneChange(comprobante: ComprobanteDian, event: Event): void {
    const input = event.target as HTMLInputElement;
    comprobante.cune = input.value;
    
    // Emitir el cambio para actualizar el array
    const comprobantes = this.comprobantes();
    const index = comprobantes.findIndex(c => c.secuencia === comprobante.secuencia);
    if (index !== -1) {
      comprobantes[index] = { ...comprobante };
      this.comprobantesChange.emit([...comprobantes]);
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO');
  }
  
  // Métodos de paginación
  goToFirstPage(): void {
    if (this.firstPageUrl()) {
      this.currentPage.set(1);
      this.loadComprobantesPage(this.firstPageUrl());
    }
  }
  
  goToNextPage(): void {
    if (this.nextPageUrl()) {
      this.currentPage.update(page => page + 1);
      this.loadComprobantesPage(this.nextPageUrl()!);
    }
  }
  
  goToPrevPage(): void {
    if (this.prevPageUrl()) {
      this.currentPage.update(page => Math.max(1, page - 1));
      this.loadComprobantesPage(this.prevPageUrl()!);
    }
  }
  
  // Computed para verificar si se pueden hacer las acciones
  canGoNext = computed(() => !!this.nextPageUrl());
  canGoPrev = computed(() => !!this.prevPageUrl());
  
  // Método para cargar una página específica
  loadComprobantesPage(url: string): void {
    this.isLoading.set(true);
    
    this.comprobantesService.getComprobantesByUrl(url).subscribe({
      next: (response) => {
        // Actualizar URLs de paginación
        this.firstPageUrl.set(response.first.$ref);
        this.nextPageUrl.set(response.next?.$ref || null);
        this.prevPageUrl.set(response.prev?.$ref || null);
        this.isLoading.set(false);
        
        // Emitir los comprobantes actualizados al componente padre
        this.comprobantesChange.emit(response.items);
      },
      error: (error) => {
        console.error('Error cargando página de comprobantes:', error);
        this.isLoading.set(false);
      }
    });
  }
  
  // Método para inicializar la paginación (llamado desde el componente padre)
  initializePagination(secuencia: number, firstPageUrl: string, nextPageUrl?: string, prevPageUrl?: string): void {
    this.currentSecuencia.set(secuencia);
    this.firstPageUrl.set(firstPageUrl);
    this.nextPageUrl.set(nextPageUrl || null);
    this.prevPageUrl.set(prevPageUrl || null);
    this.currentPage.set(1);
  }
  
  // Métodos para manejar filtros
  toggleFilter(): void {
    this.showFilters.update(value => !value);
  }
  
  onCodigoEmpleadoFilterChange(): void {
    const value = this.codigoEmpleadoFilter().trim();
    // Solo buscar si tiene al menos 3 caracteres o está vacío
    if (value.length === 0 || value.length >= 3) {
      this.onFilterChange();
    }
  }
  
  onNombreEmpleadoFilterChange(): void {
    const value = this.nombreEmpleadoFilter().trim();
    // Solo buscar si tiene al menos 3 caracteres o está vacío
    if (value.length === 0 || value.length >= 3) {
      this.onFilterChange();
    }
  }
  
  onFilterChange(): void {
    const filters: {codigoempleado?: string, nombre?: string} = {};
    
    const codigo = this.codigoEmpleadoFilter().trim();
    const nombre = this.nombreEmpleadoFilter().trim();
    
    // Solo incluir filtros con al menos 3 caracteres
    if (codigo.length >= 3) {
      filters.codigoempleado = codigo;
    }
    
    if (nombre.length >= 3) {
      filters.nombre = nombre;
    }
    
    this.filterChange.emit(filters);
  }
  
  // Métodos para manejar el modal CUNE
  onCuneDblClick(comprobante: ComprobanteDian, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedComprobanteForCune.set(comprobante);
    this.showCuneModal.set(true);
  }
  
  // Método alternativo para mobile usando touch
  onCuneTouchStart(comprobante: ComprobanteDian, event: TouchEvent): void {
    const touch = event.changedTouches[0];
    const target = event.target as HTMLElement;
    
    // Guardar posición y tiempo del primer toque
    target.dataset['touchStartX'] = touch.clientX.toString();
    target.dataset['touchStartY'] = touch.clientY.toString();
    target.dataset['touchStartTime'] = Date.now().toString();
  }
  
  onCuneTouchEnd(comprobante: ComprobanteDian, event: TouchEvent): void {
    const touch = event.changedTouches[0];
    const target = event.target as HTMLElement;
    
    const startX = parseFloat(target.dataset['touchStartX'] || '0');
    const startY = parseFloat(target.dataset['touchStartY'] || '0');
    const startTime = parseInt(target.dataset['touchStartTime'] || '0');
    
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();
    
    // Verificar que el toque sea en el mismo lugar y rápido (doble tap)
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const duration = endTime - startTime;
    
    // Si el toque es muy corto (< 300ms) y está cerca (doble tap)
    if (duration < 300 && distance < 50) {
      const tapCount = parseInt(target.dataset['tapCount'] || '0') + 1;
      target.dataset['tapCount'] = tapCount.toString();
      
      // Limpiar el contador después de 400ms
      setTimeout(() => {
        target.dataset['tapCount'] = '0';
      }, 400);
      
      // Si se detectan 2 taps rápidos, abrir el modal
      if (tapCount >= 2) {
        event.stopPropagation();
        this.selectedComprobanteForCune.set(comprobante);
        // Usar setTimeout para asegurar que el modal se abra después del event
        setTimeout(() => {
          this.showCuneModal.set(true);
        }, 100);
      }
    }
  }
  
  onCloseCuneModal(): void {
    this.showCuneModal.set(false);
    this.selectedComprobanteForCune.set(null);
  }
  
  onSaveCune(data: { comprobante: ComprobanteDian, cune: string }): void {
    // Actualizar el comprobante localmente
    const comprobantes = this.comprobantes();
    const index = comprobantes.findIndex(c => c.secuencia === data.comprobante.secuencia);
    if (index !== -1) {
      comprobantes[index] = { ...data.comprobante, cune: data.cune };
      this.comprobantesChange.emit([...comprobantes]);
    }
  }
}
