import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent {
  isOpen = input<boolean>(false);
  title = input<string>('Confirmar acción');
  message = input<string>('¿Estás seguro de realizar esta acción?');
  confirmText = input<string>('Confirmar');
  cancelText = input<string>('Cancelar');
  type = input<'danger' | 'warning' | 'info'>('warning');

  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getTypeClass(): string {
    return `confirmation-${this.type()}`;
  }
}

