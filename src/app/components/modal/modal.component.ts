import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  isOpen = input.required<boolean>();
  title = input<string>('');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  
  close = output<void>();
  
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
  
  onCloseClick(): void {
    this.close.emit();
  }
}
