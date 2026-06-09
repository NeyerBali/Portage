import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Client, ClientUpsert } from 'src/app/shared/models';

@Component({
  selector: 'app-client-popup',
  standalone: false,
  templateUrl: './client-popup.component.html',
  styleUrls: ['./client-popup.component.scss'],
})
export class ClientPopupComponent implements OnInit {
  get isEdit(): boolean { return !!this.data.client; }

  form = this.fb.group({
    raisonSociale: ['', [Validators.required]],
    secteur: ['', [Validators.required]],
    contact: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    ville: ['', [Validators.required]],
    siret: [''],
    telephone: [''],
    adresse: [''],
  });

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<ClientPopupComponent>,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { client: Client | null },
  ) {}

  get f() { return this.form.controls; }

  ngOnInit(): void {
    if (this.data.client) this.form.patchValue(this.data.client);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Veuillez corriger les champs en erreur.', 'Formulaire incomplet');
      return;
    }
    this.ref.close({ dto: this.form.value as ClientUpsert });
  }

  cancel(): void { this.ref.close(); }
}
