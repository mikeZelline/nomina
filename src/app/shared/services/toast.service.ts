import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  message: string;
  type: ToastType;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private showToast = signal<boolean>(false);
  private toastMessage = signal<string>('');
  private toastType = signal<ToastType>('info');
  private toastDuration = signal<number>(4000);
  
  // Getters for the signals
  get show() {
    return this.showToast.asReadonly();
  }
  
  get message() {
    return this.toastMessage.asReadonly();
  }
  
  get type() {
    return this.toastType.asReadonly();
  }
  
  get duration() {
    return this.toastDuration.asReadonly();
  }
  
  showToastMessage(message: string, type: ToastType = 'info', duration: number = 3000): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastDuration.set(duration);
    this.showToast.set(true);
    
    // Auto-hide after duration
    setTimeout(() => {
      this.hideToast();
    }, duration);
  }
  
  success(message: string, duration?: number): void {
    this.showToastMessage(message, 'success', duration);
  }
  
  error(message: string, duration?: number): void {
    this.showToastMessage(message, 'error', duration);
  }
  
  warning(message: string, duration?: number): void {
    this.showToastMessage(message, 'warning', duration);
  }
  
  info(message: string, duration?: number): void {
    this.showToastMessage(message, 'info', duration);
  }
  
  hideToast(): void {
    this.showToast.set(false);
  }
}

