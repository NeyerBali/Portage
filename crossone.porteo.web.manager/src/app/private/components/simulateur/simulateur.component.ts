import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '../../http/api.service';
import { SimulationResult } from 'src/app/shared/models';

@Component({
  selector: 'app-simulateur',
  standalone: false,
  templateUrl: './simulateur.component.html',
  styleUrls: ['./simulateur.component.scss'],
})
export class SimulateurComponent implements OnInit {
  result?: SimulationResult;
  loading = false;

  form = this.fb.group({
    tjm: [600],
    joursParMois: [18],
  });

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit(): void { this.simulate(); }

  simulate(): void {
    const v = this.form.value;
    if (!v.tjm || !v.joursParMois) return;
    this.loading = true;
    this.api.config.simulate({ tjm: Number(v.tjm), joursParMois: Number(v.joursParMois) }).subscribe({
      next: r => { this.result = r; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  pct(part: number): number {
    return this.result && this.result.facturable ? Math.round((part / this.result.facturable) * 100) : 0;
  }
}
