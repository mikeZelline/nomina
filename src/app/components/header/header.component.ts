import { Component, input, output, HostListener, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParametrosNomina } from '@shared/models/parametros-nomina.interface';
import { Empresa } from '@shared/models/empresa.interface';
import { EmpresasService } from '@shared/services/empresas.service';
import { Lote } from '@shared/models/lote.interface';
import { LotesService } from '@shared/services/lotes.service';
import { ComprobantesDianService } from '@shared/services/comprobantes-dian.service';
import { ComprobanteDian } from '@shared/models/comprobante-dian.interface';
import { LotesRowsComponent } from '@app/components/lotes-rows/lotes-rows.component';
import { EmpresasModalComponent } from '@app/components/empresas-modal/empresas-modal.component';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { LoteModalComponent } from '@app/components/lote-modal/lote-modal.component';
import { ToastService } from '@shared/services/toast.service';
import { ToastComponent } from '@app/components/toast/toast.component';
import { LoaderService } from '@shared/services/loader.service';
import { ConfirmationComponent } from '@app/components/confirmation/confirmation.component';
import * as XLSX from 'xlsx-js-style';

interface ComprobantesPaginationInfo {
  secuencia: number;
  firstPageUrl: string;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LotesRowsComponent, EmpresasModalComponent, PaginationComponent, LoteModalComponent, ToastComponent, ConfirmationComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  parametros = input.required<ParametrosNomina>();
  parametrosChange = output<ParametrosNomina>();
  logout = output<void>();
  profile = output<void>();
  lotesChange = output<Lote[]>();
  comprobantesChange = output<ComprobanteDian[]>();
  comprobantesPaginationChange = output<ComprobantesPaginationInfo>();
  comprobantesFilterChange = output<{codigoempleado?: string, nombre?: string}>();
  exportComprobantes = output<void>();
  
  // Lotes para mostrar en filas
  lotes = signal<Lote[]>([]);

  showUserMenu = false;
  currentUser = '';
  showEmpresasModal = false;
  showLoteModal = false;
  loteSeleccionado: Lote | null = null;
  showConfirmationModal = false;
  loteToDelete: Lote | null = null;
  
  // Estados para confirmación de cambio de candado
  showFirstCandadoConfirmation = false;
  showSecondCandadoConfirmation = false;
  loteToUpdateCandado: { lote: Lote, oldCandado: string, newCandado: string } | null = null;
  
  // Empresas
  empresas = signal<Empresa[]>([]);
  currentEmpresaIndex = signal<number>(0);
  currentEmpresa = signal<Empresa | null>(null);
  isCompanyFocused = signal<boolean>(false);
  
  // URLs de paginación
  private firstPageUrl = signal<string>('');
  private nextPageUrl = signal<string | null>(null);
  private prevPageUrl = signal<string | null>(null);
  
  // URLs de paginación para lotes
  private lotesFirstPageUrl = signal<string>('');
  private lotesNextPageUrl = signal<string | null>(null);
  private lotesPrevPageUrl = signal<string | null>(null);
  private lotesCurrentPage = signal<number>(1);
  
  // Filtros para lotes
  lotesAnoFilter: number | null = null;
  lotesMesFilter: number | null = null;
  
  // Filtros para comprobantes
  comprobantesCodigoEmpleadoFilter: string | null = null;
  comprobantesNombreFilter: string | null = null;

  constructor(
    private empresasService: EmpresasService,
    private lotesService: LotesService,
    private comprobantesDianService: ComprobantesDianService,
    private loaderService: LoaderService
  ) {}
  
  toastService = inject(ToastService);

  ngOnInit(): void {
    // Obtener el nombre del usuario desde localStorage o usar valor por defecto
    this.currentUser = localStorage.getItem('currentUser') || 'Admin';
    
    // Cargar empresas
    this.loadEmpresas();
  }

  meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];


  onParametroChange(field: keyof ParametrosNomina, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = field === 'año' || field === 'consecutivo' || field === 'lote' 
      ? parseInt(target.value) 
      : target.value;
    
    const updatedParametros = { ...this.parametros(), [field]: value };
    this.parametrosChange.emit(updatedParametros);
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  onProfile(): void {
    this.showUserMenu = false;
    this.profile.emit();
  }

  onLogout(): void {
    this.showUserMenu = false;
    this.logout.emit();
  }

  loadEmpresas(url?: string, setIndexToLast: boolean = false): void {
    this.empresasService.getEmpresas(url).subscribe({
      next: (response) => {
        this.empresas.set(response.items);
        this.firstPageUrl.set(response.first.$ref);
        this.nextPageUrl.set(response.next?.$ref || null);
        this.prevPageUrl.set(response.prev?.$ref || null);
        
        if (response.items.length > 0) {
          if (setIndexToLast) {
            // Si venimos de la página siguiente, posicionarse en el último registro
            const lastIndex = response.items.length - 1;
            this.currentEmpresaIndex.set(lastIndex);
            this.currentEmpresa.set(response.items[lastIndex]);
          } else {
            // Si vamos a la página siguiente, posicionarse en el primer registro
            this.currentEmpresaIndex.set(0);
            this.currentEmpresa.set(response.items[0]);
          }
          
          // Cargar lotes y comprobantes de la empresa actual
          this.loadLotes();
          this.loadComprobantes();
        }
      },
      error: (error) => {
        console.error('Error cargando empresas:', error);
      }
    });
  }

  loadLotes(url?: string): void {
    const currentEmpresa = this.currentEmpresa();
    if (currentEmpresa) {
      let requestUrl: string;
      
      if (url) {
        // Si hay URL específica (paginación), usarla directamente
        requestUrl = url;
      } else {
        // Si no hay URL específica, construir con filtros
        this.lotesCurrentPage.set(1);
        this.lotesService.getLotesByEmpresa(
          currentEmpresa.secuencia, 
          this.lotesAnoFilter || undefined, 
          this.lotesMesFilter || undefined
        ).subscribe({
          next: (response) => {
            this.lotes.set(response.items);
            this.lotesChange.emit(response.items);
            
            this.lotesFirstPageUrl.set(response.first.$ref);
            this.lotesNextPageUrl.set(response.next?.$ref || null);
            this.lotesPrevPageUrl.set(response.prev?.$ref || null);
          },
          error: (error) => {
            console.error('Error cargando lotes:', error);
            this.lotes.set([]);
            this.lotesChange.emit([]);
          }
        });
        return;
      }
      
      this.lotesService.getLotesByUrl(requestUrl).subscribe({
        next: (response) => {
          // Actualizar lotes localmente y emitir
          this.lotes.set(response.items);
          this.lotesChange.emit(response.items);
          
          // Guardar URLs de paginación
          this.lotesFirstPageUrl.set(response.first.$ref);
          this.lotesNextPageUrl.set(response.next?.$ref || null);
          this.lotesPrevPageUrl.set(response.prev?.$ref || null);
        },
        error: (error) => {
          console.error('Error cargando lotes:', error);
          this.lotes.set([]);
          this.lotesChange.emit([]);
        }
      });
    }
  }

  loadComprobantes(): void {
    const currentEmpresa = this.currentEmpresa();
    if (currentEmpresa) {
      this.comprobantesDianService.getComprobantesBySecuencia(
        currentEmpresa.secuencia,
        this.comprobantesCodigoEmpleadoFilter || undefined,
        this.comprobantesNombreFilter || undefined
      ).subscribe({
        next: (response) => {
          this.comprobantesChange.emit(response.items);
          // Emitir información de paginación
          this.comprobantesPaginationChange.emit({
            secuencia: currentEmpresa.secuencia,
            firstPageUrl: response.first.$ref,
            nextPageUrl: response.next?.$ref || null,
            prevPageUrl: response.prev?.$ref || null
          });
        },
        error: (error) => {
          console.error('Error cargando comprobantes:', error);
          this.comprobantesChange.emit([]);
        }
      });
    } else {
      this.comprobantesChange.emit([]);
    }
  }
  
  // Método para manejar cambios en filtros de comprobantes
  onComprobantesFilterChange(filters: {codigoempleado?: string, nombre?: string}): void {
    this.comprobantesCodigoEmpleadoFilter = filters.codigoempleado || null;
    this.comprobantesNombreFilter = filters.nombre || null;
    
    // Recargar comprobantes con los nuevos filtros
    this.loadComprobantes();
  }

  onCompanyFocus(): void {
    this.isCompanyFocused.set(true);
  }

  onCompanyBlur(): void {
    this.isCompanyFocused.set(false);
  }

  /*
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isCompanyFocused()) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.nextEmpresa();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.previousEmpresa();
    }
  }
    */

  nextEmpresa(): void {
    const currentIndex = this.currentEmpresaIndex();
    const totalEmpresas = this.empresas().length;
    
    if (totalEmpresas === 0) return;
    
    // Si estamos en el último registro, cargar la siguiente página
    if (currentIndex === totalEmpresas - 1) {
      const nextUrl = this.nextPageUrl();
      if (nextUrl) {
        this.loadEmpresas(nextUrl, false);
      }
    } else {
      // Navegar al siguiente registro en el array actual
      const nextIndex = currentIndex + 1;
      this.currentEmpresaIndex.set(nextIndex);
      this.currentEmpresa.set(this.empresas()[nextIndex]);
      this.loadLotes();
      this.loadComprobantes();
    }
  }

  previousEmpresa(): void {
    const currentIndex = this.currentEmpresaIndex();
    const totalEmpresas = this.empresas().length;
    
    if (totalEmpresas === 0) return;
    
    // Si estamos en el primer registro, cargar la página anterior
    if (currentIndex === 0) {
      const prevUrl = this.prevPageUrl();
      if (prevUrl) {
        this.loadEmpresas(prevUrl, true);
      }
    } else {
      // Navegar al registro anterior en el array actual
      const prevIndex = currentIndex - 1;
      this.currentEmpresaIndex.set(prevIndex);
      this.currentEmpresa.set(this.empresas()[prevIndex]);
      this.loadLotes();
      this.loadComprobantes();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.showUserMenu = false;
    }
  }

  // Métodos para el modal de empresas
  openEmpresasModal(): void {
    this.showEmpresasModal = true;
    this.loaderService.hide(); // Cerrar cargador al abrir modal
  }

  closeEmpresasModal(): void {
    this.showEmpresasModal = false;
  }

  onEmpresaSelect(empresa: Empresa): void {
    // Actualizar la empresa actual directamente
    this.currentEmpresa.set(empresa);
    
    // Buscar el índice en la lista actual, si no está, usar 0
    const index = this.empresas().findIndex(e => e.secuencia === empresa.secuencia);
    this.currentEmpresaIndex.set(index !== -1 ? index : 0);
    
    // Cargar datos asociados
    this.loadLotes();
    this.loadComprobantes();
  }

  // Métodos de paginación para lotes
  goToLotesFirstPage(): void {
    const firstUrl = this.lotesFirstPageUrl();
    if (firstUrl) {
      this.lotesCurrentPage.set(1);
      this.loadLotes(firstUrl);
    }
  }

  goToLotesNextPage(): void {
    const nextUrl = this.lotesNextPageUrl();
    if (nextUrl) {
      this.lotesCurrentPage.update(page => page + 1);
      this.loadLotes(nextUrl);
    }
  }

  goToLotesPrevPage(): void {
    const prevUrl = this.lotesPrevPageUrl();
    if (prevUrl) {
      this.lotesCurrentPage.update(page => Math.max(1, page - 1));
      this.loadLotes(prevUrl);
    }
  }

  // Getters para las URLs de paginación de lotes
  getLotesFirstPageUrl(): string {
    return this.lotesFirstPageUrl();
  }

  getLotesNextPageUrl(): string | null {
    return this.lotesNextPageUrl();
  }

  getLotesPrevPageUrl(): string | null {
    return this.lotesPrevPageUrl();
  }

  getLotesCurrentPage(): number {
    return this.lotesCurrentPage();
  }

  // Métodos para filtros de lotes
  onLotesFilterChange(filters: {ano?: number, mes?: number}): void {
    this.lotesAnoFilter = filters.ano || null;
    this.lotesMesFilter = filters.mes || null;
    
    // Recargar lotes con los nuevos filtros
    this.loadLotes();
  }

  clearLotesFilters(): void {
    this.lotesAnoFilter = null;
    this.lotesMesFilter = null;
    this.loadLotes();
  }

  // Métodos para el modal de lotes
  openLoteModal(): void {
    this.loteSeleccionado = null; // Para crear nuevo lote
    this.showLoteModal = true;
    this.loaderService.hide(); // Cerrar cargador al abrir modal
  }

  closeLoteModal(): void {
    this.showLoteModal = false;
    this.loteSeleccionado = null;
  }

  onSaveLote(formData: any): void {
    const currentEmpresa = this.currentEmpresa();
    if (!currentEmpresa) {
      console.error('No hay empresa seleccionada');
      return;
    }
    
    // Validar que todos los campos requeridos estén presentes
    if (!formData.ano || !formData.mes || !formData.accion) {
      console.error('Faltan campos requeridos');
      return;
    }
    
    // Llamar al endpoint para crear el lote
    this.lotesService.createLote(
      currentEmpresa.secuencia,
      formData.ano,
      formData.mes,
      formData.accion
    ).subscribe({
      next: (response) => {
        // Verificar el status de la respuesta
        if (response.status === 'error') {
          // Si hay error, mostrar toast de error y NO cerrar el modal
          const message = response.message || 'Error al guardar el lote';
          this.toastService.error(message);
        } else if (response.status === 'success') {
          // Solo si es success, mostrar toast, cerrar modal y recargar lotes
          const message = response.message || 'Lote guardado exitosamente';
          this.toastService.success(message);
          this.closeLoteModal();
          // Recargar lotes después de guardar
          this.loadLotes();
        } else {
          // Otros casos (info, etc.)
          const message = response.message || 'Lote guardado exitosamente';
          this.toastService.info(message);
          this.closeLoteModal();
          this.loadLotes();
        }
      },
      error: (error) => {
        console.error('Error guardando lote:', error);
        // En caso de error HTTP, mostrar mensaje pero no cerrar modal
        const errorMessage = error.error?.message || 'Error al guardar el lote';
        this.toastService.error(errorMessage);
      }
    });
  }

  onClonarLote(lote: Lote): void {
    // Guardar el lote seleccionado para pre-llenar el formulario
    this.loteSeleccionado = { ...lote }; // Clonar el objeto
    this.showLoteModal = true;
    this.loaderService.hide(); // Cerrar cargador al abrir modal
  }

  onEliminarLote(lote: Lote): void {
    this.loteToDelete = lote;
    this.showConfirmationModal = true;
    this.loaderService.hide(); // Cerrar cargador al abrir modal
  }

  onCandadoChange(event: {lote: Lote, candado: string, oldCandado: string}): void {
    // Guardar el valor anterior y el nuevo valor
    const oldCandado = event.oldCandado;
    const newCandado = event.candado;
    
    // Si no hay cambio real, no hacer nada
    if (oldCandado === newCandado) {
      return;
    }
    
    // Guardar la información del cambio para los modales
    this.loteToUpdateCandado = {
      lote: event.lote,
      oldCandado: oldCandado,
      newCandado: newCandado
    };
    
    // Revertir el cambio en el select (restaurar valor anterior)
    const currentLotes = this.lotes();
    const index = currentLotes.findIndex(l => l.secuencia === event.lote.secuencia);
    if (index !== -1) {
      const updatedLotes = [...currentLotes];
      updatedLotes[index] = { ...updatedLotes[index], candado: oldCandado };
      this.lotes.set(updatedLotes);
    }
    
    // Mostrar el primer modal de confirmación
    this.showFirstCandadoConfirmation = true;
  }
  
  onConfirmFirstCandado(): void {
    if (!this.loteToUpdateCandado) {
      return;
    }
    
    // Cerrar el primer modal y mostrar el segundo
    this.showFirstCandadoConfirmation = false;
    this.showSecondCandadoConfirmation = true;
  }
  
  onCancelFirstCandado(): void {
    this.showFirstCandadoConfirmation = false;
    this.loteToUpdateCandado = null;
  }
  
  onConfirmSecondCandado(): void {
    if (!this.loteToUpdateCandado) {
      return;
    }
    
    const { lote, newCandado } = this.loteToUpdateCandado;
    
    // Llamar al endpoint para actualizar el candado
    this.lotesService.updateCandado(lote.secuencia, newCandado).subscribe({
      next: (response: any) => {
        // Actualizar el lote en el array local
        const currentLotes = this.lotes();
        const index = currentLotes.findIndex(l => l.secuencia === lote.secuencia);
        if (index !== -1) {
          const updatedLotes = [...currentLotes];
          updatedLotes[index] = { ...updatedLotes[index], candado: newCandado };
          this.lotes.set(updatedLotes);
          this.lotesChange.emit(updatedLotes);
        }
        
        this.toastService.success('Estado del lote actualizado exitosamente');
        this.closeCandadoConfirmationModals();
      },
      error: (error: any) => {
        console.error('Error actualizando candado:', error);
        const errorMessage = error.error?.message || 'Error al actualizar el estado del lote';
        this.toastService.error(errorMessage);
        this.closeCandadoConfirmationModals();
      }
    });
  }
  
  onCancelSecondCandado(): void {
    this.closeCandadoConfirmationModals();
  }
  
  closeCandadoConfirmationModals(): void {
    this.showFirstCandadoConfirmation = false;
    this.showSecondCandadoConfirmation = false;
    this.loteToUpdateCandado = null;
  }
  
  getFirstCandadoMessage(): string {
    if (!this.loteToUpdateCandado) {
      return '';
    }
    
    // Si el select está en N y se cambia a S
    if (this.loteToUpdateCandado.oldCandado === 'N' && this.loteToUpdateCandado.newCandado === 'S') {
      return '¿Desea habilitar la edición del lote?';
    }
    
    // Si el select está en S y se cambia a N
    if (this.loteToUpdateCandado.oldCandado === 'S' && this.loteToUpdateCandado.newCandado === 'N') {
      return '¿Desea proteger el lote?';
    }
    
    return '¿Está seguro de realizar este cambio?';
  }
  
  getSecondCandadoMessage(): string {
    return '¿Está totalmente seguro?';
  }

  onConfirmDelete(): void {
    if (!this.loteToDelete) {
      return;
    }

    // Aquí iría la lógica para eliminar el lote
    // Por ahora solo recargamos los lotes
    
    // TODO: Implementar llamada al servicio para eliminar el lote
    // this.lotesService.deleteLote(this.loteToDelete.secuencia).subscribe({
    //   next: () => {
    //     this.toastService.success('Lote eliminado exitosamente');
    //     this.loadLotes();
    //   },
    //   error: (error) => {
    //     this.toastService.error('Error al eliminar el lote');
    //   }
    // });

    // Por ahora solo recargamos
    this.toastService.success('Lote eliminado exitosamente');
    this.loadLotes();
    this.closeConfirmationModal();
  }

  onCancelDelete(): void {
    this.closeConfirmationModal();
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    this.loteToDelete = null;
  }

  // Método para exportar lotes a Excel (todas las páginas)
  exportLotesToExcel(): void {
    const currentEmpresa = this.currentEmpresa();
    if (!currentEmpresa) {
      this.toastService.warning('No hay empresa seleccionada');
      return;
    }

    // Mostrar mensaje de carga
    this.toastService.info('Cargando todos los lotes...');
    this.loaderService.show();

    // Obtener la URL de la primera página o construirla
    const firstPageUrl = this.lotesFirstPageUrl();
    let initialUrl: string;

    if (firstPageUrl) {
      // Usar la URL de la primera página guardada
      initialUrl = firstPageUrl;
    } else {
      // Si no hay URL guardada, obtener la primera página con los filtros actuales
      this.lotesService.getLotesByEmpresa(
        currentEmpresa.secuencia,
        this.lotesAnoFilter || undefined,
        this.lotesMesFilter || undefined
      ).subscribe({
        next: (response) => {
          // Guardar la URL de la primera página
          this.lotesFirstPageUrl.set(response.first.$ref);
          // Iniciar la obtención de todas las páginas
          this.getAllLotesForExport(response.first.$ref);
        },
        error: (error) => {
          this.loaderService.hide();
          console.error('Error obteniendo primera página:', error);
          this.toastService.error('Error al obtener los lotes. Por favor, intente nuevamente.');
        }
      });
      return;
    }

    // Si ya tenemos la URL inicial, obtener todos los lotes
    this.getAllLotesForExport(initialUrl);
  }

  // Método auxiliar para obtener todos los lotes de todas las páginas
  private getAllLotesForExport(initialUrl: string): void {
    // Función recursiva para obtener todas las páginas
    const getAllLotes = (url: string, allLotes: Lote[] = []): Promise<Lote[]> => {
      return new Promise((resolve, reject) => {
        this.lotesService.getLotesByUrl(url).subscribe({
          next: (response) => {
            // Agregar los lotes de esta página
            const updatedLotes = [...allLotes, ...response.items];
            
            // Si hay siguiente página, continuar
            if (response.next?.$ref) {
              getAllLotes(response.next.$ref, updatedLotes)
                .then(resolve)
                .catch(reject);
            } else {
              // No hay más páginas, retornar todos los lotes
              resolve(updatedLotes);
            }
          },
          error: (error) => {
            console.error('Error cargando lotes para exportación:', error);
            reject(error);
          }
        });
      });
    };

    // Obtener todos los lotes
    getAllLotes(initialUrl)
      .then((allLotes: Lote[]) => {
        this.loaderService.hide();

        if (allLotes.length === 0) {
          this.toastService.warning('No hay lotes para exportar');
          return;
        }

        const currentEmpresa = this.currentEmpresa();
        if (!currentEmpresa) {
          return;
        }

        // Obtener el nombre de la empresa
        const empresaNombre = currentEmpresa.nombre || 'Empresa';

        // Mapear los lotes a formato Excel con nombres de columnas legibles
        // Excluir: Secuencia, Sucursal Pila, Notas, Tracking ID, Token
        // Reemplazar Empresa con el nombre de la empresa
        const excelData = allLotes.map(lote => ({
          'Empresa': empresaNombre,
          'Año': lote.ano,
          'Mes': lote.mes_nombre.toUpperCase(),
          'Lote': lote.lote,
          'Consecutivo': lote.consecutivo,
          'Enviado': lote.ajuste === 'S' ? 'Enviado' : 'Cancelado',
          'Fecha Envío': lote.fechaenvio,
          'Acción': this.getProcedimiento(lote.accion),
          'Candado': lote.candado === 'S' ? 'Enviado' : 'Cancelado'
        }));

        // Crear workbook y worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Lotes');

        // Definir anchos de columnas (sin las columnas eliminadas)
        const columnWidths = [
          { wch: 25 }, // Empresa (nombre completo)
          { wch: 6 },  // Año
          { wch: 12 }, // Mes
          { wch: 8 },  // Lote
          { wch: 12 }, // Consecutivo
          { wch: 12 }, // Enviado
          { wch: 25 }, // Fecha Envío (más ancho para evitar que aumente el alto)
          { wch: 18 }, // Acción
          { wch: 12 }  // Candado
        ];
        worksheet['!cols'] = columnWidths;

        // Obtener el rango de celdas
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        
        // Aplicar formato a los encabezados (fila 1)
        const headerStyle = {
          fill: {
            fgColor: { rgb: '4472C4' } // Azul
          },
          font: {
            color: { rgb: 'FFFFFF' }, // Blanco
            bold: true,
            sz: 11
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
          },
          border: {
            top: { style: 'thin', color: { rgb: 'FFFFFF' } },
            bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
            left: { style: 'thin', color: { rgb: 'FFFFFF' } },
            right: { style: 'thin', color: { rgb: 'FFFFFF' } }
          }
        };

        // Aplicar estilo a cada celda del encabezado
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
          if (!worksheet[cellAddress]) continue;
          
          worksheet[cellAddress].s = headerStyle;
        }

        // Aplicar formato a las celdas de datos
        const dataStyle = {
          alignment: {
            vertical: 'center',
            wrapText: true
          },
          border: {
            top: { style: 'thin', color: { rgb: 'D0D0D0' } },
            bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
            left: { style: 'thin', color: { rgb: 'D0D0D0' } },
            right: { style: 'thin', color: { rgb: 'D0D0D0' } }
          }
        };

        // Aplicar estilo a las celdas de datos
        for (let row = range.s.r + 1; row <= range.e.r; row++) {
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            if (!worksheet[cellAddress]) continue;
            
            worksheet[cellAddress].s = { ...dataStyle };
          }
        }

        // Congelar la primera fila (encabezados)
        worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

        // Generar nombre de archivo con fecha
        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `Lotes_${empresaNombre}_${fecha}.xlsx`;

        // Descargar el archivo
        XLSX.writeFile(workbook, fileName);
        
        this.toastService.success(`Se exportaron ${allLotes.length} lotes exitosamente`);
      })
      .catch((error) => {
        this.loaderService.hide();
        console.error('Error exportando lotes:', error);
        this.toastService.error('Error al exportar los lotes. Por favor, intente nuevamente.');
      });
  }

  // Helper para obtener el nombre del procedimiento
  private getProcedimiento(codigo: string): string {
    const procedimientosMap: { [key: string]: string } = {
      'NINM': 'Normal Mes',
      'NIAM': 'Ajuste Modificación',
      'NIAE': 'Ajuste Eliminación',
      'NINC': 'Novedad Contractual',
      'NINT': 'Normal Tardía',
      'NINR': 'Normal Rechazado'
    };
    return procedimientosMap[codigo] || codigo;
  }

  // Método para exportar comprobantes a Excel (todas las páginas)
  exportComprobantesToExcel(): void {
    const currentEmpresa = this.currentEmpresa();
    if (!currentEmpresa) {
      this.toastService.warning('No hay empresa seleccionada');
      return;
    }

    // Mostrar mensaje de carga
    this.toastService.info('Cargando todos los comprobantes...');
    this.loaderService.show();

    // Obtener la URL inicial con los filtros actuales
    this.comprobantesDianService.getComprobantesBySecuencia(
      currentEmpresa.secuencia,
      this.comprobantesCodigoEmpleadoFilter || undefined,
      this.comprobantesNombreFilter || undefined
    ).subscribe({
      next: (response) => {
        // Iniciar la obtención de todas las páginas
        this.getAllComprobantesForExport(response.first.$ref, currentEmpresa);
      },
      error: (error) => {
        this.loaderService.hide();
        console.error('Error obteniendo primera página de comprobantes:', error);
        this.toastService.error('Error al obtener los comprobantes. Por favor, intente nuevamente.');
      }
    });
  }

  // Método auxiliar para obtener todos los comprobantes de todas las páginas
  private getAllComprobantesForExport(initialUrl: string, currentEmpresa: Empresa): void {
    // Función recursiva para obtener todas las páginas
    const getAllComprobantes = (url: string, allComprobantes: ComprobanteDian[] = []): Promise<ComprobanteDian[]> => {
      return new Promise((resolve, reject) => {
        this.comprobantesDianService.getComprobantesByUrl(url).subscribe({
          next: (response) => {
            // Agregar los comprobantes de esta página
            const updatedComprobantes = [...allComprobantes, ...response.items];
            
            // Si hay siguiente página, continuar
            if (response.next?.$ref) {
              getAllComprobantes(response.next.$ref, updatedComprobantes)
                .then(resolve)
                .catch(reject);
            } else {
              // No hay más páginas, retornar todos los comprobantes
              resolve(updatedComprobantes);
            }
          },
          error: (error) => {
            console.error('Error cargando comprobantes para exportación:', error);
            reject(error);
          }
        });
      });
    };

    // Obtener todos los comprobantes
    getAllComprobantes(initialUrl)
      .then((allComprobantes: ComprobanteDian[]) => {
        this.loaderService.hide();

        if (allComprobantes.length === 0) {
          this.toastService.warning('No hay comprobantes para exportar');
          return;
        }

        // Obtener el nombre de la empresa
        const empresaNombre = currentEmpresa.nombre || 'Empresa';

        // Mapear los comprobantes a formato Excel con nombres de columnas legibles
        const excelData = allComprobantes.map(comp => ({
          'Empresa': empresaNombre,
          'Código Empleado': comp.empleado,
          'Nombre Empleado': comp.nombre_empleado || '',
          'Consecutivo': comp.consecutivo,
          'Marcación': comp.marcacion,
          'CUNE': comp.cune || '',
          'Prefijo': comp.prefijo,
          'Número Comprobante': comp.numerocomprobantedian,
          'Fecha Pago': comp.fechapago,
          'Devengado Total': comp.devengadototal,
          'Deducido Total': comp.deducidototal,
          'Redondeo Total': comp.redondeototal,
          'Comprobante Total': comp.comprobantetotal,
          'Sueldo Trabajado': comp.sueldotrabajado,
          'Días Laborados': comp.diaslaborados,
          'Auxilio Transporte': comp.aux_transporte,
          'Fecha Desde': comp.fechadesde,
          'Fecha Hasta': comp.fechahasta,
          'Tracking ID': comp.tracking_id || '',
          'Nov. Contractual': comp.nov_contractual || ''
        }));

        // Crear workbook y worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Comprobantes');

        // Definir anchos de columnas
        const columnWidths = [
          { wch: 25 }, // Empresa
          { wch: 15 }, // Código Empleado
          { wch: 30 }, // Nombre Empleado
          { wch: 12 }, // Consecutivo
          { wch: 12 }, // Marcación
          { wch: 20 }, // CUNE
          { wch: 10 }, // Prefijo
          { wch: 18 }, // Número Comprobante
          { wch: 25 }, // Fecha Pago (más ancho para evitar que aumente el alto)
          { wch: 15 }, // Devengado Total
          { wch: 15 }, // Deducido Total
          { wch: 15 }, // Redondeo Total
          { wch: 18 }, // Comprobante Total
          { wch: 15 }, // Sueldo Trabajado
          { wch: 12 }, // Días Laborados
          { wch: 15 }, // Auxilio Transporte
          { wch: 15 }, // Fecha Desde
          { wch: 15 }, // Fecha Hasta
          { wch: 20 }, // Tracking ID
          { wch: 15 }  // Nov. Contractual
        ];
        worksheet['!cols'] = columnWidths;

        // Obtener el rango de celdas
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        
        // Aplicar formato a los encabezados (fila 1)
        const headerStyle = {
          fill: {
            fgColor: { rgb: '4472C4' } // Azul
          },
          font: {
            color: { rgb: 'FFFFFF' }, // Blanco
            bold: true,
            sz: 11
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
          },
          border: {
            top: { style: 'thin', color: { rgb: 'FFFFFF' } },
            bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
            left: { style: 'thin', color: { rgb: 'FFFFFF' } },
            right: { style: 'thin', color: { rgb: 'FFFFFF' } }
          }
        };

        // Aplicar estilo a cada celda del encabezado
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
          if (!worksheet[cellAddress]) continue;
          
          worksheet[cellAddress].s = headerStyle;
        }

        // Aplicar formato a las celdas de datos
        const dataStyle = {
          alignment: {
            vertical: 'center',
            wrapText: true
          },
          border: {
            top: { style: 'thin', color: { rgb: 'D0D0D0' } },
            bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
            left: { style: 'thin', color: { rgb: 'D0D0D0' } },
            right: { style: 'thin', color: { rgb: 'D0D0D0' } }
          }
        };

        // Aplicar estilo a las celdas de datos
        for (let row = range.s.r + 1; row <= range.e.r; row++) {
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            if (!worksheet[cellAddress]) continue;
            
            worksheet[cellAddress].s = { ...dataStyle };
          }
        }

        // Congelar la primera fila (encabezados)
        worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

        // Generar nombre de archivo con fecha
        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `Comprobantes_${empresaNombre}_${fecha}.xlsx`;

        // Descargar el archivo
        XLSX.writeFile(workbook, fileName);
        
        this.toastService.success(`Se exportaron ${allComprobantes.length} comprobantes exitosamente`);
      })
      .catch((error) => {
        this.loaderService.hide();
        console.error('Error exportando comprobantes:', error);
        this.toastService.error('Error al exportar los comprobantes. Por favor, intente nuevamente.');
      });
  }
}
