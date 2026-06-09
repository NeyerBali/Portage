import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiService } from '../../http/api.service';
import { Absence, ABSENCE_TYPES, ABSENCE_STATUTS, rhLabel } from 'src/app/shared/models';

@Component({
  selector: 'app-absences-list',
  standalone: false,
  templateUrl: './absences-list.component.html',
  styleUrls: ['./absences-list.component.scss'],
})
export class AbsencesListComponent implements OnInit {
  absences: Absence[] = [];
  loading = true;
  showForm = false;
  types = ABSENCE_TYPES;
  typeLabel = (v: string) => rhLabel(ABSENCE_STATUTS, v);
  absTypeLabel = (v: string) => ABSENCE_TYPES.find(t => t.value === v)?.label ?? v;
  statutLabel = (v: string) => rhLabel(ABSENCE_STATUTS, v);

  form = this.fb.group({
    type: ['conge_paye', Validators.required],
    dateDebut: ['', Validators.required],
    dateFin: ['', Validators.required],
    motif: [''],
  });

  constructor(private fb: FormBuilder, public auth: AuthService, private api: ApiService, private toastr: ToastrService) {}

  get isAdmin(): boolean { return this.auth.isAdmin; }
  get isConsultant(): boolean { return !!this.auth.consultantId; }
  get f() { return this.form.controls; }

  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.api.rh.absencesList().subscribe({ next: a => { this.absences = a; this.loading = false; }, error: () => (this.loading = false) });
  }

  add(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.api.rh.absenceCreate(this.form.value).subscribe({
      next: () => { this.toastr.success('Demande d\'absence envoyée.'); this.showForm = false; this.form.patchValue({ motif: '' }); this.load(); },
      error: () => {},
    });
  }

  approve(a: Absence): void { this.api.rh.absenceApprove(a.id).subscribe(() => { this.toastr.success('Absence approuvée.'); this.load(); }); }
  refuse(a: Absence): void { this.api.rh.absenceRefuse(a.id).subscribe(() => { this.toastr.success('Absence refusée.'); this.load(); }); }
  del(a: Absence): void { this.api.rh.absenceDelete(a.id).subscribe(() => { this.toastr.success('Demande supprimée.'); this.load(); }); }
}
