import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ThemeService, PALETTES, Palette } from 'src/app/core/services/theme.service';
import { Me } from 'src/app/shared/models';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

const VITRINE_KEY = 'porteo-vitrine-palette';
const NOTIF_KEY = 'porteo-notifs';

interface NotifPrefs { missions: boolean; factures: boolean; retards: boolean; hebdo: boolean; }

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  tab: 'profil' | 'prefs' | 'securite' = 'profil';
  palettes = PALETTES;
  vitrinePalette: Palette = 'emerald';
  me?: Me;
  twoFactor = false;
  savingProfile = false;
  changingPwd = false;

  notif: NotifPrefs = { missions: true, factures: true, retards: true, hebdo: false };

  profileForm = this.fb.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    fonction: [''],
  });

  pwdForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    public theme: ThemeService,
    private toastr: ToastrService,
    private dialog: MatDialog,
  ) {}

  get roleLabel(): string { return this.auth.isAdmin ? 'Administrateur' : 'Consultant'; }
  get pf() { return this.profileForm.controls; }
  get pwf() { return this.pwdForm.controls; }
  get initials(): string {
    const n = this.auth.fullName || 'P';
    return n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  ngOnInit(): void {
    this.vitrinePalette = (localStorage.getItem(VITRINE_KEY) as Palette) || 'emerald';
    try { const raw = localStorage.getItem(NOTIF_KEY); if (raw) this.notif = JSON.parse(raw); } catch {}

    this.auth.me().subscribe(me => {
      this.me = me;
      this.twoFactor = me.twoFactorEnabled;
      this.profileForm.patchValue({
        prenom: me.prenom, nom: me.nom, email: me.email,
        telephone: me.telephone ?? '', fonction: me.fonction ?? '',
      });
    });
  }

  // ----- Profil -----
  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile = true;
    this.auth.updateProfile(this.profileForm.value as any).subscribe({
      next: () => { this.savingProfile = false; this.toastr.success('Vos informations ont été mises à jour.', 'Profil enregistré'); },
      error: () => (this.savingProfile = false),
    });
  }

  // ----- Préférences -----
  setPalette(p: Palette, name: string): void { this.theme.setPalette(p); this.toastr.success(`${name} est maintenant active.`, 'Palette appliquée'); }
  setVitrine(p: Palette, name: string): void { this.vitrinePalette = p; localStorage.setItem(VITRINE_KEY, p); this.toastr.success(`${name} sera appliquée au site public.`, 'Palette du site vitrine'); }
  setTheme(mode: 'light' | 'dark'): void { this.theme.setTheme(mode); }
  saveNotif(): void { localStorage.setItem(NOTIF_KEY, JSON.stringify(this.notif)); }

  // ----- Sécurité -----
  changePwd(): void {
    if (this.pwdForm.invalid) { this.pwdForm.markAllAsTouched(); return; }
    if (this.pwf.newPassword.value !== this.pwf.confirm.value) {
      this.toastr.warning('Les mots de passe ne correspondent pas.', 'Vérification');
      return;
    }
    this.changingPwd = true;
    this.auth.changePassword({
      currentPassword: this.pwf.currentPassword.value!,
      newPassword: this.pwf.newPassword.value!,
    }).subscribe({
      next: () => { this.changingPwd = false; this.pwdForm.reset(); this.toastr.success('Votre mot de passe a été modifié.', 'Sécurité'); },
      error: () => (this.changingPwd = false),
    });
  }

  toggle2fa(enabled: boolean): void {
    this.auth.setTwoFactor(enabled).subscribe({
      next: me => { this.twoFactor = me.twoFactorEnabled; this.toastr.success(enabled ? 'Double authentification activée.' : 'Double authentification désactivée.', 'Sécurité'); },
      error: () => (this.twoFactor = !enabled),
    });
  }

  deactivate(): void {
    this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'porteo-dialog', width: '440px',
      data: { title: 'Désactiver le compte', message: "Cette démonstration ne désactive aucun compte réel.", confirmLabel: 'Désactiver', destructive: true },
    }).afterClosed().subscribe(ok => { if (ok) this.toastr.warning("Action sensible — non appliquée en démonstration.", 'Zone sensible'); });
  }
}
