import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ThemeService, PALETTES, Palette } from 'src/app/core/services/theme.service';
import { AgencyProfile, GlobalParameter, Me, TotpSetupResult } from 'src/app/shared/models';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ApiService } from '../../http/api.service';

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
  tab: 'profil' | 'prefs' | 'securite' | 'config' | 'agence' = 'profil';
  palettes = PALETTES;
  vitrinePalette: Palette = 'emerald';
  me?: Me;
  twoFactor = false;
  savingProfile = false;
  changingPwd = false;

  // Authentificateur (TOTP)
  totpEnabled = false;
  totpSetup?: TotpSetupResult;
  totpCode = '';
  totpBusy = false;

  // Admin : paramètres globaux + profil agence
  parameters: GlobalParameter[] = [];
  agency: AgencyProfile = {} as AgencyProfile;

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
    private api: ApiService,
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
      this.totpEnabled = me.totpEnabled;
      this.profileForm.patchValue({
        prenom: me.prenom, nom: me.nom, email: me.email,
        telephone: me.telephone ?? '', fonction: me.fonction ?? '',
      });
    });

    if (this.auth.isAdmin) {
      this.api.config.parameters().subscribe(p => (this.parameters = p));
      this.api.config.agency().subscribe(a => (this.agency = a ?? ({} as AgencyProfile)));
    }
  }

  // ----- Paramètres globaux (admin) -----
  saveParam(p: GlobalParameter): void {
    this.api.config.updateParameter(p.cle, p.valeur).subscribe(() => this.toastr.success(`${p.libelle} mis à jour.`, 'Paramètre'));
  }

  // ----- Profil agence (admin) -----
  saveAgency(): void {
    this.api.config.updateAgency(this.agency).subscribe(() => this.toastr.success("Profil de l'agence enregistré.", 'Agence'));
  }

  /** Upload du logo ou de la signature → base64, puis enregistrement. */
  onAgencyImage(event: Event, field: 'logo' | 'signature'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.toastr.warning('Sélectionnez une image (PNG, JPG, SVG).', 'Image'); return; }
    if (file.size > 1_500_000) { this.toastr.warning('Image trop lourde (1,5 Mo maximum).', 'Image'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      this.agency[field] = reader.result as string;
      this.api.config.updateAgency(this.agency).subscribe(() =>
        this.toastr.success(field === 'logo' ? 'Logo enregistré — il apparaît sur les factures.' : 'Signature enregistrée — elle apparaît sur les factures.', 'Agence'));
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeAgencyImage(field: 'logo' | 'signature'): void {
    this.agency[field] = '';
    this.api.config.updateAgency(this.agency).subscribe(() =>
      this.toastr.info(field === 'logo' ? 'Logo retiré.' : 'Signature retirée.', 'Agence'));
  }

  // ----- Pad de signature manuscrite -----
  @ViewChild('sigCanvas') sigCanvas?: ElementRef<HTMLCanvasElement>;
  signPadOpen = false;
  sigEmpty = true;
  private sigCtx?: CanvasRenderingContext2D;
  private sigDrawing = false;

  openSigPad(): void { this.signPadOpen = true; setTimeout(() => this.initSigCanvas(), 30); }
  closeSigPad(): void { this.signPadOpen = false; this.sigCtx = undefined; }

  private initSigCanvas(): void {
    const c = this.sigCanvas?.nativeElement;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#16201C';
    this.sigCtx = ctx;
    this.sigEmpty = true;
  }

  private sigPos(e: PointerEvent): { x: number; y: number } {
    const r = this.sigCanvas!.nativeElement.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  onSigDown(e: PointerEvent): void {
    if (!this.sigCtx) return;
    e.preventDefault();
    this.sigDrawing = true;
    const p = this.sigPos(e);
    this.sigCtx.beginPath();
    this.sigCtx.moveTo(p.x, p.y);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  onSigMove(e: PointerEvent): void {
    if (!this.sigDrawing || !this.sigCtx) return;
    const p = this.sigPos(e);
    this.sigCtx.lineTo(p.x, p.y);
    this.sigCtx.stroke();
    this.sigEmpty = false;
  }
  onSigUp(): void { this.sigDrawing = false; }

  clearSig(): void {
    const c = this.sigCanvas?.nativeElement;
    if (c && this.sigCtx) this.sigCtx.clearRect(0, 0, c.width, c.height);
    this.sigEmpty = true;
  }

  saveSig(): void {
    if (this.sigEmpty) { this.toastr.warning('Dessinez votre signature avant d’enregistrer.', 'Signature'); return; }
    const dataUrl = this.sigCanvas!.nativeElement.toDataURL('image/png');
    this.agency.signature = dataUrl;
    this.api.config.updateAgency(this.agency).subscribe(() => {
      this.toastr.success('Signature enregistrée — elle apparaît sur les factures.', 'Agence');
      this.signPadOpen = false;
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

  // ----- Authentificateur (TOTP) -----
  startTotpSetup(): void {
    this.totpBusy = true;
    this.auth.setupTotp().subscribe({
      next: s => { this.totpBusy = false; this.totpSetup = s; this.totpCode = ''; },
      error: () => (this.totpBusy = false),
    });
  }

  confirmTotp(): void {
    if (!this.totpCode || this.totpCode.length < 6) { this.toastr.warning('Saisissez le code à 6 chiffres.', 'Authentificateur'); return; }
    this.totpBusy = true;
    this.auth.confirmTotp(this.totpCode).subscribe({
      next: () => { this.totpBusy = false; this.totpEnabled = true; this.totpSetup = undefined; this.toastr.success('Authentificateur activé.', 'Sécurité'); },
      error: () => { this.totpBusy = false; this.toastr.error('Code invalide, réessayez.', 'Authentificateur'); },
    });
  }

  cancelTotpSetup(): void { this.totpSetup = undefined; this.totpCode = ''; }

  disableTotp(): void {
    this.auth.disableTotp().subscribe(() => { this.totpEnabled = false; this.toastr.success('Authentificateur désactivé.', 'Sécurité'); });
  }

  deactivate(): void {
    this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'porteo-dialog', width: '440px',
      data: { title: 'Désactiver le compte', message: "Cette démonstration ne désactive aucun compte réel.", confirmLabel: 'Désactiver', destructive: true },
    }).afterClosed().subscribe(ok => { if (ok) this.toastr.warning("Action sensible — non appliquée en démonstration.", 'Zone sensible'); });
  }
}
