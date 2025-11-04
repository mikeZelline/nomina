import { Component, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '@app/components/modal/modal.component';
import { ToastComponent } from '@app/components/toast/toast.component';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-lote-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ToastComponent],
  templateUrl: './lote-modal.component.html',
  styleUrl: './lote-modal.component.css'
})
export class LoteModalComponent {
  isOpen = input.required<boolean>();
  title = input<string>('Crear Nuevo Lote');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('xl');
  loteData = input<any>(null); // Datos del lote para editar
  
  close = output<void>();
  save = output<any>();
  
  // Formulario data
  formulario = {
    ano: null as number | null,
    mes: null as number | null,
    sucursalpila: '',
    accion: 'NINM',
    consecutivo: null as number | null,
    lote: null as number | null,
    candado: 'S'
  };
  
  meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];
  
  yearValue: string = '';

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
  
  toastService = inject(ToastService);
  
  constructor() {
    // Reset form when modal closes
    effect(() => {
      if (!this.isOpen()) {
        this.resetForm();
      }
    });
    
    // Load lote data when modal opens and loteData is provided
    effect(() => {
      const loteData = this.loteData();
      if (this.isOpen() && loteData) {
        this.loadLoteData(loteData);
      }
    });
  }
  
  loadLoteData(lote: any): void {
    
    // Cargar año
    if (lote.ano) {
      this.yearValue = lote.ano.toString();
      this.formulario.ano = lote.ano;
    }
    
    // Cargar mes (convertir mes_nombre a número)
    if (lote.mes_nombre) {
      const mesNum = this.getMesNumber(lote.mes_nombre);
      if (mesNum) {
        this.formulario.mes = mesNum;
      }
    }
    
    // Cargar otros campos
    this.formulario.sucursalpila = lote.sucursalpila || '';
    this.formulario.accion = lote.accion || 'NINM';
    this.formulario.consecutivo = lote.consecutivo || null;
    this.formulario.lote = lote.lote || null;
    this.formulario.candado = lote.candado || 'S';
  }
  
  getMesNumber(mesNombre: string): number | null {
    const mesesMap: { [key: string]: number } = {
      'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4,
      'Mayo': 5, 'Junio': 6, 'Julio': 7, 'Agosto': 8,
      'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
    };
    return mesesMap[mesNombre] || null;
  }
  
  resetForm(): void {
    this.formulario = {
      ano: null,
      mes: null,
      sucursalpila: '',
      accion: 'NINM',
      consecutivo: null,
      lote: null,
      candado: 'S'
    };
    this.yearValue = '';
  }
  
  onYearChange(value: string): void {
    // Si está vacío, permitir
    if (value === '') {
      this.yearValue = '';
      this.formulario.ano = null;
      return;
    }
    
    // Solo aceptar números
    if (!/^\d+$/.test(value)) {
      return; // No actualizar si no es un número
    }
    
    // Si tiene exactamente 4 dígitos, validar rango
    if (value.length === 4) {
      const yearNum = parseInt(value, 10);
      
      if (yearNum >= 1990 && yearNum <= 2050) {
        this.yearValue = value;
        this.formulario.ano = yearNum;
      } else {
        // Año fuera de rango: borrar y mostrar toast
        this.yearValue = '';
        this.formulario.ano = null;
        this.toastService.error('El año debe estar entre 1990 y 2050');
      }
    } else {
      // Permitir escribir mientras no sea 4 dígitos
      this.yearValue = value;
      this.formulario.ano = null;
    }
  }
  
  onClose(): void {
    this.close.emit();
  }
  
  onSave(): void {
    // Validate required fields
    if (!this.formulario.ano || !this.formulario.mes) {
      return;
    }
    
    // Prepare data to send (mes is already a number 1-12)
    const dataToSend: any = {
      ano: this.formulario.ano,
      mes: this.formulario.mes, // Ya es un número 1-12
      sucursalpila: this.formulario.sucursalpila,
      accion: this.formulario.accion,
      candado: this.formulario.candado
    };
    
    // Solo incluir consecutivo y lote si estamos editando
    if (this.loteData()) {
      dataToSend.consecutivo = this.formulario.consecutivo;
      dataToSend.lote = this.formulario.lote;
    }
    
    this.save.emit(dataToSend);
  }
}

