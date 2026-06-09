import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Consultant, ConsultantUpsert } from 'src/app/shared/models';

@Component({
  selector: 'app-consultant-popup',
  standalone: false,
  templateUrl: './consultant-popup.component.html',
  styleUrls: ['./consultant-popup.component.scss'],
})
export class ConsultantPopupComponent implements OnInit {
  get isEdit(): boolean { return !!this.data.consultant; }

  form = this.fb.group({
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    specialite: ['', [Validators.required]],
    tjm: [null as number | null, [Validators.required, Validators.min(0.01)]],
    ville: ['', [Validators.required]],
    competences: [''],
    telephone: [''],
    statut: ['active', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<ConsultantPopupComponent>,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { consultant: Consultant | null },
  ) {}

  get f() { return this.form.controls; }

  ngOnInit(): void {
    if (this.data.consultant) this.form.patchValue(this.data.consultant);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Veuillez corriger les champs en erreur.', 'Formulaire incomplet');
      return;
    }
    this.ref.close({ dto: this.form.value as ConsultantUpsert });
  }

  cancel(): void { this.ref.close(); }
}
