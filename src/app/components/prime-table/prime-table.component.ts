import { ChangeDetectionStrategy, Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { input, signal } from '@angular/core';

export interface PrimeTableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filter?: boolean;
  filterType?: 'text' | 'numeric' | 'date';
  filterMatchMode?: string;
  width?: string;
}

@Component({
  selector: 'app-prime-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, RippleModule, InputTextModule, FormsModule],
  templateUrl: './prime-table.component.html',
  styleUrl: './prime-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrimeTableComponent {
  data = input.required<any[]>();
  columns = input.required<PrimeTableColumn[]>();
  rows = input<number>(10);
  paginator = input<boolean>(true);
  rowsPerPageOptions = input<number[]>([5, 10, 20, 50]);
  showGlobalFilter = input<boolean>(true);
  globalFilterFields = input<string[]>([]);
  enableRowExpansion = input<boolean>(false);
  rowExpansionTemplate = input<TemplateRef<any> | null>(null);
  dataKey = input<string>('id');
  responsiveLayout = input<'scroll' | 'stack'>('scroll');

  protected searchValue = signal<string>('');

  onGlobalFilter(table: Table, value: string): void {
    table.filterGlobal(value, 'contains');
  }

  resolveField(data: any, field: string): any {
    if (!data || !field) {
      return '';
    }
    return field.split('.')
      .reduce((acc: any, part: string) => (acc && acc[part] !== undefined ? acc[part] : null), data);
  }
}

