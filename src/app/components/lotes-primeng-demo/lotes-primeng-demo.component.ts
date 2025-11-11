import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeDataTableComponent, PrimeDataTableColumn } from '@app/components/prime-data-table/prime-data-table.component';

interface DemoLote {
  id: number;
  ano: number;
  mes: string;
  lote: number;
  consecutivo: number;
  estado: 'Enviado' | 'Cancelado';
  fechaEnvio: string;
  accion: string;
  notas: string;
}

@Component({
  selector: 'app-lotes-primeng-demo',
  standalone: true,
  imports: [CommonModule, PrimeDataTableComponent],
  templateUrl: './lotes-primeng-demo.component.html',
  styleUrl: './lotes-primeng-demo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LotesPrimengDemoComponent {
  private readonly rawData = signal<DemoLote[]>(generateLotesDemo());

  data = computed(() => this.rawData());

  columns: PrimeDataTableColumn[] = [
    { field: 'ano', header: 'Año', sortable: true, filterable: true, width: '100px' },
    { field: 'mes', header: 'Mes', sortable: true, filterable: true, width: '120px' },
    { field: 'lote', header: 'Lote', sortable: true, filterable: true, width: '100px' },
    { field: 'consecutivo', header: 'Consecutivo', sortable: true, filterable: true, width: '140px' },
    { field: 'estado', header: 'Estado', sortable: true, filterable: true, width: '140px' },
    { field: 'fechaEnvio', header: 'Fecha Envío', sortable: true, filterable: true, width: '180px' },
    { field: 'accion', header: 'Acción', sortable: true, filterable: true },
  ];

  expansionContext = (row: DemoLote) => ({ $implicit: row });
}

function generateLotesDemo(): DemoLote[] {
  const monthNames = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  const actions = ['Normal Mes', 'Novedad Contractual', 'Ajuste Modificación', 'Ajuste Eliminación'];

  const items: DemoLote[] = [];
  const now = new Date();

  for (let i = 1; i <= 32; i++) {
    const monthIndex = (i + now.getMonth()) % 12;
    const year = now.getFullYear() - Math.floor(i / 12);
    items.push({
      id: i,
      ano: year,
      mes: monthNames[monthIndex],
      lote: 1000 + i,
      consecutivo: 2000 + i,
      estado: i % 5 === 0 ? 'Cancelado' : 'Enviado',
      fechaEnvio: new Date(now.getTime() - i * 86400000).toISOString(),
      accion: actions[i % actions.length],
      notas: `Notas demostrativas para el lote ${1000 + i}`
    });
  }
  return items;
}

