import { Component, ContentChildren, EventEmitter, Input, OnChanges, Output, QueryList, TemplateRef } from '@angular/core';
import { ColumnCellDirective } from './column-cell.directive';

export interface DataColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  format?: 'text' | 'number' | 'currency' | 'date';
}

/** Tableau de données générique : recherche, tri par colonne, pagination, cellules personnalisables. */
@Component({
  selector: 'app-data-table',
  standalone: false,
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent<T = any> implements OnChanges {
  @Input() columns: DataColumn[] = [];
  @Input() rows: T[] = [];
  @Input() pageSize = 10;
  @Input() searchable = true;
  @Input() searchPlaceholder = 'Rechercher…';
  @Input() clickable = false;
  @Output() rowClick = new EventEmitter<T>();

  @ContentChildren(ColumnCellDirective) cellDirs!: QueryList<ColumnCellDirective>;

  search = '';
  sortKey = '';
  sortDir: 'asc' | 'desc' = 'asc';
  page = 1;

  ngOnChanges(): void { this.page = 1; }

  get filtered(): T[] {
    const q = this.search.trim().toLowerCase();
    let r = this.rows ?? [];
    if (q) r = r.filter(row => this.columns.some(c => String((row as any)[c.key] ?? '').toLowerCase().includes(q)));
    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      r = [...r].sort((a, b) => {
        const av = (a as any)[this.sortKey], bv = (b as any)[this.sortKey];
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av ?? '').localeCompare(String(bv ?? ''), 'fr', { numeric: true }) * dir;
      });
    }
    return r;
  }

  get total(): number { return this.filtered.length; }
  get pageCount(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  get paged(): T[] { const s = (this.page - 1) * this.pageSize; return this.filtered.slice(s, s + this.pageSize); }
  get from(): number { return this.total ? (this.page - 1) * this.pageSize + 1 : 0; }
  get to(): number { return Math.min(this.page * this.pageSize, this.total); }

  onSearch(): void { this.page = 1; }
  sort(c: DataColumn): void {
    if (!c.sortable) return;
    if (this.sortKey === c.key) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    else { this.sortKey = c.key; this.sortDir = 'asc'; }
  }
  sortIcon(c: DataColumn): string { return this.sortKey !== c.key ? '↕' : (this.sortDir === 'asc' ? '↑' : '↓'); }
  goPage(p: number): void { this.page = Math.min(this.pageCount, Math.max(1, p)); }

  templateFor(key: string): TemplateRef<any> | null {
    return this.cellDirs?.find(d => d.columnKey === key)?.tpl ?? null;
  }
}
