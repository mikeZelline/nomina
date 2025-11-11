import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, contentChild, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

export interface PrimeDataTableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  styleClass?: string;
  width?: string;
}

@Component({
  selector: 'app-prime-data-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule],
  templateUrl: './prime-data-table.component.html',
  styleUrl: './prime-data-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrimeDataTableComponent {
  data = input.required<unknown[]>();
  columns = input.required<PrimeDataTableColumn[]>();
  rows = input<number>(10);
  rowsPerPageOptions = input<number[]>([5, 10, 20, 50]);
  enableRowExpansion = input<boolean>(false);
  enableGlobalSearch = input<boolean>(true);
  rowExpansionKey = input<string>('id');

  private rowExpansionContent = contentChild<TemplateRef<unknown>>('rowExpansion');

  @ViewChild('tableRef') private tableRef?: any;
  globalFilter = signal<string>('');

  filterFields = computed(() => this.columns().filter(column => column.filterable).map(column => column.field));

  onGlobalFilter(value: string): void {
    this.globalFilter.set(value);
    const table = this.tableRef;
    if (table) {
      table.filterGlobal(value, 'contains');
    }
  }

  toggleRow(row: unknown): void {
    if (!this.enableRowExpansion() || !this.tableRef) {
      return;
    }
    this.tableRef.toggleRow(row);
  }

  get hasRowExpansionTemplate(): boolean {
    return !!this.rowExpansionContent();
  }

  get expansionTemplate(): TemplateRef<unknown> | null {
    return this.hasRowExpansionTemplate ? this.rowExpansionContent()! : null;
  }
}

