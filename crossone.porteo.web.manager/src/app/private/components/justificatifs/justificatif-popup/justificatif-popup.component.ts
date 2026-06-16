import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription, debounceTime } from 'rxjs';
import { JUSTIF_TYPES, Justificatif, justifTypeLabel, Mission } from 'src/app/shared/models';

const DRAFT_KEY = 'porteo-justif-draft';

@Component({
  selector: 'app-justificatif-popup',
  standalone: false,
  templateUrl: './justificatif-popup.component.html',
  styleUrls: ['./justificatif-popup.component.scss'],
})
export class JustificatifPopupComponent implements OnInit, OnDestroy {
  types = JUSTIF_TYPES;
  typeLabel = justifTypeLabel;

  file?: File;
  filePreviewUrl?: string;
  fileIsImage = false;
  dragOver = false;

  reuseOpen = false;
  hasDraft = false;

  private sub?: Subscription;

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
    @Inject(MAT_DIALOG_DATA) public data: { missions: Mission[]; justificatifs?: Justificatif[] },
  ) {}

  ngOnInit(): void {
    this.hasDraft = !!localStorage.getItem(DRAFT_KEY);
    // Sauvegarde automatique du brouillon (champs texte uniquement, pas le fichier).
    this.sub = this.form.valueChanges.pipe(debounceTime(400)).subscribe(v => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(v));
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.revoke();
  }

  get f() { return this.form.controls; }

  // ── Justificatifs réutilisables (déjà saisis) ─────────────────────────────
  get reusable(): Justificatif[] { return (this.data.justificatifs ?? []).slice(0, 8); }

  reuse(j: Justificatif): void {
    this.form.patchValue({
      missionId: j.missionId, type: j.type, libelle: j.libelle,
      montant: j.montant ?? null, notes: j.notes ?? '',
    });
    this.reuseOpen = false;
    this.toastr.info(`Champs repris depuis « ${j.libelle} ».`, 'Réutilisé');
  }

  // ── Brouillon ─────────────────────────────────────────────────────────────
  resumeDraft(): void {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) { try { this.form.patchValue(JSON.parse(raw)); } catch { /* ignore */ } }
    this.hasDraft = false;
  }
  discardDraft(): void { localStorage.removeItem(DRAFT_KEY); this.hasDraft = false; }

  // ── Mission sélectionnée ──────────────────────────────────────────────────
  get selectedMission(): Mission | undefined {
    const id = Number(this.form.value.missionId);
    return id ? this.data.missions.find(m => m.id === id) : undefined;
  }
  missionInitials(m?: Mission): string {
    const s = m?.clientNom || m?.titre || '?';
    return s.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  // ── Progression ───────────────────────────────────────────────────────────
  get checklist(): { key: string; label: string; done: boolean }[] {
    const v = this.form.value;
    return [
      { key: 'mission', label: 'Mission', done: !!v.missionId },
      { key: 'type', label: 'Type', done: !!v.type },
      { key: 'libelle', label: 'Libellé', done: !!(v.libelle && v.libelle.trim()) },
      { key: 'date', label: 'Date', done: !!v.dateJustificatif },
      { key: 'montant', label: 'Montant', done: v.montant != null && (v.montant as any) !== '' },
      { key: 'fichier', label: 'Fichier', done: !!this.file },
    ];
  }
  get doneCount(): number { return this.checklist.filter(c => c.done).length; }
  get totalCount(): number { return this.checklist.length; }
  get progress(): number { return Math.round((this.doneCount / this.totalCount) * 100); }
  get remaining(): number { return this.totalCount - this.doneCount; }
  // Cercle de progression (r=34 → circonférence ≈ 213.6)
  readonly ringCirc = 2 * Math.PI * 34;
  get ringOffset(): number { return this.ringCirc * (1 - this.progress / 100); }

  // ── Fichier (dropzone + aperçu) ───────────────────────────────────────────
  onFileInput(e: Event): void { this.setFile((e.target as HTMLInputElement).files?.[0]); }
  onDrop(e: DragEvent): void { e.preventDefault(); this.dragOver = false; this.setFile(e.dataTransfer?.files?.[0]); }
  onDragOver(e: DragEvent): void { e.preventDefault(); this.dragOver = true; }
  onDragLeave(e: DragEvent): void { e.preventDefault(); this.dragOver = false; }

  private setFile(f?: File): void {
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) { this.toastr.warning('Fichier trop lourd (15 Mo maximum).', 'Pièce jointe'); return; }
    this.revoke();
    this.file = f;
    this.fileIsImage = f.type.startsWith('image/');
    this.filePreviewUrl = URL.createObjectURL(f);
  }
  removeFile(): void { this.revoke(); this.file = undefined; this.fileIsImage = false; }
  viewFile(): void { if (this.filePreviewUrl) window.open(this.filePreviewUrl, '_blank'); }
  private revoke(): void { if (this.filePreviewUrl) { URL.revokeObjectURL(this.filePreviewUrl); this.filePreviewUrl = undefined; } }

  // ── Soumission ────────────────────────────────────────────────────────────
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Veuillez compléter les champs obligatoires.', 'Formulaire incomplet');
      return;
    }
    const v = this.form.value;
    localStorage.removeItem(DRAFT_KEY);
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
