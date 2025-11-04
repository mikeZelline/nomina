import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-input.component.html',
  styleUrl: './filter-input.component.css'
})
export class FilterInputComponent {
  value = input.required<string>();
  placeholder = input<string>('Filtrar...');
  type = input<'text' | 'number'>('text');
  valueChange = output<string>();

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(input.value);
  }
}

