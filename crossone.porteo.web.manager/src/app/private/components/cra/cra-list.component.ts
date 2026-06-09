import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiService } from '../../http/api.service';
import { Cra, CRA_STATUTS, Mission, rhLabel } from 'src/app/shared/models';

@Component({
  selector: 'app-cra-list',
  standalone: false,
  templateUrl: './cra-list.component.html',
  styleUrls: ['./cra-list.component.scss'],
})
export class CraListComponent implements OnInit {
  cras: Cra[] = [];
  missions: Mission[] = [];
  loading = true;
  showForm = false;
  statuts = CRA_STATUTS;
  statutLabel = (v: string) => rhLabel(CRA_STATUTS, v);

  form = this.fb.group({
    missionId: [null as number | null, Validators.required],
    mois: [new Date().toISOString().substring(0, 7), Validators.required],
    joursTravailles: [18, [Validators.required, Validators.min(0), Validators.max(31)]],
    joursAbsence: [0, [Validators.min(0), Validators.max(31)]],
    commentaire: [''],
  });

  constructor(private fb: FormBuilder, public auth: AuthService, private api: ApiService, private toastr: ToastrService) {}

  get isAdmin(): boolean { return this.auth.isAdmin; }
  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.load();
    this.api.missions.list({ pageSize: 200 }).subscribe(r => (this.missions = r.items));
  }

  load(): void {
    this.loading = true;
    this.api.rh.crasList().subscribe({ next: c => { this.cras = c; this.loading = false; }, error: () => (this.loading = false) });
  }

  add(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.api.rh.craCreate(this.form.value).subscribe(() => {
      this.toastr.success('CRA enregistré (brouillon).'); this.showForm = false;
      this.form.patchValue({ commentaire: '' });
      this.load();
    });
  }

  submit(c: Cra): void { this.api.rh.craSubmit(c.id).subscribe(() => { this.toastr.success('CRA soumis pour validation.'); this.load(); }); }
  validate(c: Cra): void { this.api.rh.craValidate(c.id).subscribe(() => { this.toastr.success('CRA validé.'); this.load(); }); }
  refuse(c: Cra): void { this.api.rh.craRefuse(c.id).subscribe(() => { this.toastr.success('CRA refusé.'); this.load(); }); }
  del(c: Cra): void { this.api.rh.craDelete(c.id).subscribe(() => { this.toastr.success('CRA supprimé.'); this.load(); }); }
}
