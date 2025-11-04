import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actions.component.html',
  styleUrl: './actions.component.css'
})
export class ActionsComponent {
  totalProcesados = input.required<number>();

  // Action events
  buscar = output<void>();
  mostrarTodos = output<void>();
  eliminarComprobante = output<void>();
  procesar = output<void>();
  generacionArchivos = output<void>();
  cargueCune = output<void>();
  aceptar = output<void>();
  cancelar = output<void>();

  onBuscar(): void {
    this.buscar.emit();
  }

  onMostrarTodos(): void {
    this.mostrarTodos.emit();
  }

  onEliminarComprobante(): void {
    this.eliminarComprobante.emit();
  }

  onProcesar(): void {
    this.procesar.emit();
  }

  onGeneracionArchivos(): void {
    this.generacionArchivos.emit();
  }

  onCargueCune(): void {
    this.cargueCune.emit();
  }

  onAceptar(): void {
    this.aceptar.emit();
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
