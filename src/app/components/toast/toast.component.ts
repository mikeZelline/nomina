import { Component, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  message = input<string>('');
  type = input<ToastType>('info');
  duration = input<number>(3000);
  show = input<boolean>(false);
  
  constructor() {
    // Auto-hide toast after duration
    effect(() => {
      if (this.show()) {
        setTimeout(() => {
          // This component just shows/hides based on input
          // The parent should handle the timing
        }, this.duration());
      }
    });
  }
  
  getToastClass(): string {
    return `toast toast-${this.type()}`;
  }
}

