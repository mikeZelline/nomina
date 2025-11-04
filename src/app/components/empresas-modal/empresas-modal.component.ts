import { Component, input, output, signal, computed, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresasService } from '@shared/services/empresas.service';
import { Empresa } from '@shared/models/empresa.interface';
import { ModalComponent } from '@app/components/modal/modal.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';

@Component({
  selector: 'app-empresas-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent],
  templateUrl: './empresas-modal.component.html',
  styleUrl: './empresas-modal.component.css'
})
export class EmpresasModalComponent implements OnInit, OnChanges {
  isOpen = input.required<boolean>();
  empresasService = inject(EmpresasService);
  
  empresas = signal<Empresa[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  isSearching = signal<boolean>(false);
  
  // Paginación
  firstPageUrl = signal<string>('');
  nextPageUrl = signal<string | null>(null);
  prevPageUrl = signal<string | null>(null);
  currentPage = signal<number>(1);
  
  close = output<void>();
  empresaSelect = output<Empresa>();
  
  // Empresas filtradas - ahora solo muestra las empresas del servidor
  filteredEmpresas = computed(() => this.empresas());
  
  ngOnInit(): void {
    // No cargar aquí, se cargará cuando el modal se abra
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detectar cuando el modal se abre
    if (changes['isOpen'] && this.isOpen()) {
      this.resetModal();
      this.loadEmpresas();
    }
  }
  
  resetModal(): void {
    // Resetear todos los estados a valores por defecto
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.isSearching.set(false);
    this.error.set(null);
    this.empresas.set([]);
    this.firstPageUrl.set('');
    this.nextPageUrl.set(null);
    this.prevPageUrl.set(null);
  }
  
  loadEmpresas(url?: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.empresasService.getEmpresas(url).subscribe({
      next: (response) => {
        this.empresas.set(response.items);
        this.firstPageUrl.set(response.first.$ref);
        this.nextPageUrl.set(response.next?.$ref || null);
        this.prevPageUrl.set(response.prev?.$ref || null);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading empresas:', error);
        this.error.set('Error al cargar las empresas');
        this.isLoading.set(false);
      }
    });
  }
  
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchValue = target.value.trim();
    this.searchTerm.set(searchValue);
    
    if (searchValue) {
      this.searchEmpresas(searchValue);
    } else {
      this.loadEmpresas();
    }
  }
  
  searchEmpresas(searchTerm: string): void {
    this.isSearching.set(true);
    this.isLoading.set(true);
    this.error.set(null);
    
    // Determinar si es NIT (solo números) o nombre
    const isNit = /^\d+$/.test(searchTerm);
    
    const searchParams = isNit 
      ? { nit: searchTerm, nombre: undefined }
      : { nit: undefined, nombre: searchTerm };
    
    this.empresasService.searchEmpresas(searchParams.nit, searchParams.nombre).subscribe({
      next: (response) => {
        this.empresas.set(response.items);
        this.firstPageUrl.set(response.first.$ref);
        this.nextPageUrl.set(response.next?.$ref || null);
        this.prevPageUrl.set(response.prev?.$ref || null);
        this.isLoading.set(false);
        this.isSearching.set(false);
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.error.set('Error al buscar empresas');
        this.isLoading.set(false);
        this.isSearching.set(false);
      }
    });
  }
  
  onEmpresaClick(empresa: Empresa): void {
    this.empresaSelect.emit(empresa);
    this.resetModal();
    this.close.emit();
  }
  
  onClose(): void {
    this.resetModal();
    this.close.emit();
  }
  
  // Métodos de paginación
  goToFirstPage(): void {
    if (this.firstPageUrl()) {
      this.currentPage.set(1);
      this.loadEmpresas(this.firstPageUrl());
    }
  }
  
  goToNextPage(): void {
    if (this.nextPageUrl()) {
      this.currentPage.update(page => page + 1);
      this.loadEmpresas(this.nextPageUrl()!);
    }
  }
  
  goToPrevPage(): void {
    if (this.prevPageUrl()) {
      this.currentPage.update(page => Math.max(1, page - 1));
      this.loadEmpresas(this.prevPageUrl()!);
    }
  }
  
  // Computed para verificar si se pueden hacer las acciones
  canGoNext = computed(() => !!this.nextPageUrl());
  canGoPrev = computed(() => !!this.prevPageUrl());
  
  formatNit(nit: number): string {
    return nit.toString();
  }
}
