import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '@app/components/modal/modal.component';
import { ComprobanteDian } from '@shared/models/comprobante-dian.interface';

@Component({
  selector: 'app-cune-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './cune-modal.component.html',
  styleUrl: './cune-modal.component.css'
})
export class CuneModalComponent {
  isOpen = input.required<boolean>();
  comprobante = input<ComprobanteDian | null>(null);
  
  close = output<void>();
  save = output<{ comprobante: ComprobanteDian, cune: string }>();
  
  cuneValue = signal<string>('');
  
  // Effect para actualizar el valor cuando se abre el modal o cambia el comprobante
  constructor() {
    effect(() => {
      const comprobanteData = this.comprobante();
      const isModalOpen = this.isOpen();
      
      if (isModalOpen && comprobanteData) {
        this.cuneValue.set(comprobanteData.cune || '');
      }
    });
  }
  
  onClose(): void {
    this.close.emit();
  }
  
  onSave(): void {
    const comprobanteData = this.comprobante();
    if (comprobanteData) {
      this.save.emit({
        comprobante: comprobanteData,
        cune: this.cuneValue()
      });
      this.onClose();
    }
  }
  
  getEmpleadoInfo(): string {
    const comp = this.comprobante();
    if (!comp) return '';
    return `${comp.empleado} - ${comp.nombre_empleado}`;
  }
}

