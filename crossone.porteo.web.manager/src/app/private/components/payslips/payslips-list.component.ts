import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiService } from '../../http/api.service';
import { Consultant, Payslip } from 'src/app/shared/models';

@Component({
  selector: 'app-payslips-list',
  standalone: false,
  templateUrl: './payslips-list.component.html',
  styleUrls: ['./payslips-list.component.scss'],
})
export class PayslipsListComponent implements OnInit {
  payslips: Payslip[] = [];
  consultants: Consultant[] = [];
  loading = true;
  showForm = false;
  generating = false;

  form = this.fb.group({
    consultantId: [null as number | null, Validators.required],
    mois: [new Date().toISOString().substring(0, 7), Validators.required],
  });

  constructor(private fb: FormBuilder, public auth: AuthService, private api: ApiService, private toastr: ToastrService) {}

  get isAdmin(): boolean { return this.auth.isAdmin; }
  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.load();
    if (this.isAdmin) this.api.consultants.list().subscribe(c => (this.consultants = c));
  }

  load(): void {
    this.loading = true;
    this.api.config.payslips().subscribe({ next: p => { this.payslips = p; this.loading = false; }, error: () => (this.loading = false) });
  }

  generate(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.generating = true;
    const v = this.form.value;
    this.api.config.generatePayslip(Number(v.consultantId), v.mois!).subscribe({
      next: () => { this.generating = false; this.showForm = false; this.toastr.success('Bulletin généré.'); this.load(); },
      error: () => (this.generating = false),
    });
  }

  del(p: Payslip): void { this.api.config.deletePayslip(p.id).subscribe(() => { this.toastr.success('Bulletin supprimé.'); this.load(); }); }
}
