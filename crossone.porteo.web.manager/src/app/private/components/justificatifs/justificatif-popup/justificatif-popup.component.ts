import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { JUSTIF_TYPES, Mission } from 'src/app/shared/models';

@Component({
  selector: 'app-justificatif-popup',
  standalone: false,
  templateUrl: './justificatif-popup.component.html',
  styleUrls: ['./justificatif-popup.component.scss'],
})
export class JustificatifPopupComponent {
  types = JUSTIF_TYPES;
  file?: File;

  form = this.fb.group({
    missionId: [null as number | null, [Validators.required]],
    type: ['frais', [Validators.required]],
    libelle: ['', [Validators.required]],
    montant: [null as number | null],
    dateJustificatif: [new Date().toISOString().substring(0, 10), [Validators.required]],
    notes: [''],
  });

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<JustificatifPopupComponent>,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { missions: Mission[] },
  ) {}

  get f() { return this.form.controls; }

  onFile(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.file = input.files && input.files.length ? input.files[0] : undefined;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Veuillez corriger les champs en erreur.', 'Formulaire incomplet');
      return;
    }
    const v = this.form.value;
    this.ref.close({
      form: {
        missionId: Number(v.missionId), type: v.type!, libelle: v.libelle!,
        montant: v.montant != null ? Number(v.montant) : null,
        dateJustificatif: v.dateJustificatif!, notes: v.notes ?? '',
      },
      file: this.file,
    });
  }

  cancel(): void { this.ref.close(); }
}
