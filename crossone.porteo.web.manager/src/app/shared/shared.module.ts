import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { DonutChartComponent } from './components/charts/donut-chart.component';
import { BarListComponent } from './components/charts/bar-list.component';
import { AreaChartComponent } from './components/charts/area-chart.component';
import { SparkComponent } from './components/charts/spark.component';
import { ToggleComponent } from './components/toggle/toggle.component';
import { TooltipDirective } from './directives/tooltip.directive';
import { DataTableComponent } from './components/data-table/data-table.component';
import { ColumnCellDirective } from './components/data-table/column-cell.directive';
import { DocumentViewerComponent } from './components/document-viewer/document-viewer.component';
import { TrPipe } from './pipes/tr.pipe';

const SHARED_COMPONENTS = [
  StatusBadgeComponent,
  EmptyStateComponent,
  ConfirmDialogComponent,
  DonutChartComponent,
  BarListComponent,
  AreaChartComponent,
  SparkComponent,
  ToggleComponent,
  TooltipDirective,
  DataTableComponent,
  ColumnCellDirective,
  DocumentViewerComponent,
  TrPipe,
];

@NgModule({
  declarations: [...SHARED_COMPONENTS],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MatDialogModule],
  exports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MatDialogModule,
    ...SHARED_COMPONENTS,
  ],
})
export class SharedModule {}
