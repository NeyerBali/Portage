import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FactureUpsert, Mission } from 'src/app/shared/models';
import { dateRangeValidator } from 'src/app/shared/validators/porteo-validators';

@Component({
  selector: 'app-facture-popup',
  standalone: false,
  templateUrl: './facture-popup.component.html',
  styleUrls: ['./facture-popup.component.scss'],
})
export class FacturePopupComponent implements OnInit {
  form = this.fb.group({
    missionId: [null as number | null, [Validators.required]],
    montantHT: [null as number | null, [Validators.required, Validators.min(0.01)]],
    tauxTva: [20, [Validators.required, Validators.min(0)]],
    dateEmission: ['', [Validators.required]],
    dateEcheance: ['', [Validators.required]],
    statut: ['brouillon', [Validators.required]],
  }, { validators: dateRangeValidator('dateEmission', 'dateEcheance') });

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<FacturePopupComponent>,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { missions: Mission[] },
  ) {}

  get f() { return this.form.controls; }
  get ttc(): number {
    const ht = Number(this.f.montantHT.value) || 0;
    const t = Number(this.f.tauxTva.value) || 0;
    return ht * (1 + t / 100);
  }

  ngOnInit(): void {
    const today = new Date().toISOString().substring(0, 10);
    const due = new Date(Date.now() + 30 * 864e5).toISOString().substring(0, 10);
    this.form.patchValue({ dateEmission: today, dateEcheance: due });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Veuillez corriger les champs en erreur.', 'Formulaire incomplet');
      return;
    }
    const v = this.form.value;
    const dto: FactureUpsert = {
      missionId: Number(v.missionId), montantHT: Number(v.montantHT), tauxTva: Number(v.tauxTva),
      dateEmission: v.dateEmission!, dateEcheance: v.dateEcheance!, statut: v.statut as any,
    };
    this.ref.close({ dto });
  }

  cancel(): void { this.ref.close(); }
}
