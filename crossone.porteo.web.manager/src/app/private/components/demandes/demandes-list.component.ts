import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiService } from '../../http/api.service';
import { Demande, DEMANDE_TYPES, DEMANDE_STATUTS, rhLabel } from 'src/app/shared/models';

@Component({
  selector: 'app-demandes-list',
  standalone: false,
  templateUrl: './demandes-list.component.html',
  styleUrls: ['./demandes-list.component.scss'],
})
export class DemandesListComponent implements OnInit {
  demandes: Demande[] = [];
  loading = true;
  showForm = false;
  types = DEMANDE_TYPES;
  demTypeLabel = (v: string) => DEMANDE_TYPES.find(t => t.value === v)?.label ?? v;
  statutLabel = (v: string) => rhLabel(DEMANDE_STATUTS, v);

  form = this.fb.group({
    type: ['acompte', Validators.required],
    objet: ['', Validators.required],
    montant: [null as number | null],
    description: [''],
  });

  constructor(private fb: FormBuilder, public auth: AuthService, private api: ApiService, private toastr: ToastrService) {}

  get isAdmin(): boolean { return this.auth.isAdmin; }
  get isConsultant(): boolean { return !!this.auth.consultantId; }
  get f() { return this.form.controls; }

  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.api.rh.demandesList().subscribe({ next: d => { this.demandes = d; this.loading = false; }, error: () => (this.loading = false) });
  }

  add(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.api.rh.demandeCreate(this.form.value).subscribe(() => { this.toastr.success('Demande envoyée.'); this.showForm = false; this.form.patchValue({ objet: '', description: '', montant: null }); this.load(); });
  }

  repondre(d: Demande, statut: 'traitee' | 'refusee'): void {
    const reponse = window.prompt(statut === 'traitee' ? 'Réponse / commentaire :' : 'Motif du refus :', '');
    if (reponse === null) return;
    this.api.rh.demandeRepondre(d.id, { statut, reponse }).subscribe(() => { this.toastr.success('Demande mise à jour.'); this.load(); });
  }

  del(d: Demande): void { this.api.rh.demandeDelete(d.id).subscribe(() => { this.toastr.success('Demande supprimée.'); this.load(); }); }
}
