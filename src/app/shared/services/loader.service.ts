import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private activeRequests = signal<number>(0);
  public isLoading = signal<boolean>(false);

  show(): void {
    this.activeRequests.update(count => count + 1);
    this.isLoading.set(true);
  }

  hide(): void {
    this.activeRequests.update(count => {
      const newCount = Math.max(0, count - 1);
      if (newCount === 0) {
        this.isLoading.set(false);
      }
      return newCount;
    });
  }
}

