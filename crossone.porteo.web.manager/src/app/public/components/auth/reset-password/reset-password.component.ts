import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  template: `
    <div class="auth-shell">
      <app-auth-aside></app-auth-aside>
      <main class="auth-main">
        <div class="auth-card fade-in">
          <h1>{{ first ? 'Activez votre compte' : 'Nouveau mot de passe' }}</h1>
          <p class="sub">{{ first ? 'Définissez le mot de passe de votre compte Portéo.' : 'Choisissez un nouveau mot de passe sécurisé.' }}</p>

          <div class="field-error" *ngIf="!token" style="margin-bottom:14px">⚠ Lien invalide : aucun jeton fourni.</div>

          <form (ngSubmit)="submit()" novalidate *ngIf="token">
            <div class="field" [class.invalid]="touched && errPw">
              <label>Mot de passe <span class="req">*</span></label>
              <input type="password" [(ngModel)]="pw" name="pw" placeholder="••••••••••" />
              <div *ngIf="pw" class="mt-2">
                <div class="pw-meter"><span *ngFor="let i of [0,1,2,3]" [style.background]="i < score ? colors[score-1] : 'var(--border-default)'"></span></div>
                <div class="caption" [style.color]="colors[max0(score-1)]" style="font-weight:600;margin-top:5px">{{ labels[max0(score-1)] }}</div>
              </div>
              <div class="field-error" *ngIf="touched && errPw">⚠ {{ errPw }}</div>
              <span class="field-hint" *ngIf="!errPw">8 caractères minimum, avec majuscule et chiffre.</span>
            </div>
            <div class="field" [class.invalid]="touched && errPw2">
              <label>Confirmer le mot de passe <span class="req">*</span></label>
              <input type="password" [(ngModel)]="pw2" name="pw2" placeholder="••••••••••" />
              <div class="field-error" *ngIf="touched && errPw2">⚠ {{ errPw2 }}</div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-block mt-2" [disabled]="loading">
              <span *ngIf="!loading">{{ first ? 'Activer mon compte' : 'Réinitialiser' }}</span><span *ngIf="loading" class="spin"></span>
            </button>
          </form>
          <p class="auth-foot-link"><a class="link" routerLink="/auth/login">← Retour à la connexion</a></p>
        </div>
      </main>
    </div>
  `,
})
export class ResetPasswordComponent {
  first = false;
  token = '';
  pw = '';
  pw2 = '';
  touched = false;
  loading = false;
  errPw = '';
  errPw2 = '';
  colors = ['var(--error-500)', 'var(--warning-500)', 'var(--info-500)', 'var(--success-500)'];
  labels = ['Faible', 'Moyen', 'Bon', 'Robuste'];

  constructor(route: ActivatedRoute, private router: Router, private auth: AuthService, private toastr: ToastrService) {
    this.first = route.snapshot.data['first'] === true;
    this.token = route.snapshot.queryParams['token'] || '';
  }

  get score(): number {
    let s = 0;
    if (this.pw.length >= 8) s++;
    if (/[A-Z]/.test(this.pw)) s++;
    if (/[0-9]/.test(this.pw)) s++;
    if (/[^A-Za-z0-9]/.test(this.pw)) s++;
    return s;
  }
  max0(n: number): number { return Math.max(0, n); }

  submit(): void {
    this.touched = true;
    this.errPw = this.score < 2 ? 'Choisissez un mot de passe plus robuste (8+ caractères, majuscule, chiffre).' : '';
    this.errPw2 = this.pw !== this.pw2 ? 'Les mots de passe ne correspondent pas.' : '';
    if (this.errPw || this.errPw2) return;
    this.loading = true;
    this.auth.resetPassword(this.token, this.pw).subscribe({
      next: () => { this.loading = false; this.toastr.success('Mot de passe défini. Vous pouvez vous connecter.', 'Portéo'); this.router.navigate(['/auth/login']); },
      error: (e) => { this.loading = false; this.toastr.error(e?.error?.message || 'Lien invalide ou expiré.', 'Erreur'); },
    });
  }
}
