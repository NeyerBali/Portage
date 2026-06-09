import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Client, Consultant, Mission, MISSION_STATUTS, MissionUpsert } from 'src/app/shared/models';
import { dateRangeValidator } from 'src/app/shared/validators/porteo-validators';

interface PopupData { mission: Mission | null; clients: Client[]; consultants: Consultant[]; }

@Component({
  selector: 'app-mission-popup',
  standalone: false,
  templateUrl: './mission-popup.component.html',
  styleUrls: ['./mission-popup.component.scss'],
})
export class MissionPopupComponent implements OnInit {
  statuts = MISSION_STATUTS;
  get isEdit(): boolean { return !!this.data.mission; }

  form = this.fb.group({
    titre: ['', [Validators.required]],
    description: [''],
    clientId: [null as number | null, [Validators.required]],
    consultantId: [null as number | null, [Validators.required]],
    dateDebut: ['', [Validators.required]],
    dateFin: ['', [Validators.required]],
    tjm: [null as number | null, [Validators.required, Validators.min(0.01)]],
    jours: [null as number | null, [Validators.required, Validators.min(1)]],
    statut: ['brouillon', [Validators.required]],
  }, { validators: dateRangeValidator('dateDebut', 'dateFin') });

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<MissionPopupComponent>,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: PopupData,
  ) {}

  get f() { return this.form.controls; }
  get montant(): number {
    const t = Number(this.f.tjm.value) || 0;
    const j = Number(this.f.jours.value) || 0;
    return t * j;
  }

  ngOnInit(): void {
    if (this.data.mission) {
      const m = this.data.mission;
      this.form.patchValue({
        titre: m.titre, description: m.description ?? '', clientId: m.clientId, consultantId: m.consultantId,
        dateDebut: m.dateDebut?.substring(0, 10), dateFin: m.dateFin?.substring(0, 10),
        tjm: m.tjm, jours: m.jours, statut: m.statut,
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Veuillez corriger les champs en erreur.', 'Formulaire incomplet');
      return;
    }
    const v = this.form.value;
    const dto: MissionUpsert = {
      titre: v.titre!, description: v.description ?? '', statut: v.statut as any,
      dateDebut: v.dateDebut!, dateFin: v.dateFin!,
      tjm: Number(v.tjm), jours: Number(v.jours),
      clientId: Number(v.clientId), consultantId: Number(v.consultantId),
    };
    this.ref.close({ dto });
  }

  cancel(): void { this.ref.close(); }
}
