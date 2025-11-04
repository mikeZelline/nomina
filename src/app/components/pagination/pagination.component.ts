import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  // Inputs
  currentPage = input.required<number>();
  firstPageUrl = input.required<string>();
  nextPageUrl = input<string | null>(null);
  prevPageUrl = input<string | null>(null);
  isLoading = input<boolean>(false);
  showFirstButton = input<boolean>(true);
  
  // Outputs
  firstPage = output<void>();
  nextPage = output<void>();
  prevPage = output<void>();
  
  // Computed properties
  canGoNext = computed(() => !!this.nextPageUrl());
  canGoPrev = computed(() => !!this.prevPageUrl());
  
  onFirstPage(): void {
    if (!this.isLoading()) {
      this.firstPage.emit();
    }
  }
  
  onNextPage(): void {
    if (!this.isLoading() && this.canGoNext()) {
      this.nextPage.emit();
    }
  }
  
  onPrevPage(): void {
    if (!this.isLoading() && this.canGoPrev()) {
      this.prevPage.emit();
    }
  }
}
