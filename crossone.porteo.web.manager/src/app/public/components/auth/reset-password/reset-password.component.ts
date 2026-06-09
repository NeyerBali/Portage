import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  template: `
    <div class="auth-shell">
      <app-auth-aside></app-auth-aside>
      <main class="auth-main">
        <div class="auth-card fade-in">
          <h1>{{ first ? 'Bienvenue chez Portéo' : 'Nouveau mot de passe' }}</h1>
          <p class="sub">{{ first ? 'Définissez le mot de passe de votre compte pour commencer.' : 'Choisissez un nouveau mot de passe sécurisé.' }}</p>
          <form (ngSubmit)="submit()" novalidate>
            <div class="field" [class.invalid]="touched && errPw">
              <label>Mot de passe <span class="req">*</span></label>
              <input type="password" [(ngModel)]="pw" name="pw" placeholder="••••••••••" />
              <div *ngIf="pw" class="mt-2">
                <div class="pw-meter">
                  <span *ngFor="let i of [0,1,2,3]" [style.background]="i < score ? colors[score-1] : 'var(--border-default)'"></span>
                </div>
                <div class="caption" [style.color]="colors[max0(score-1)]" style="font-weight:600; margin-top:5px">{{ labels[max0(score-1)] }}</div>
              </div>
              <div class="field-error" *ngIf="touched && errPw">⚠ {{ errPw }}</div>
              <span class="field-hint" *ngIf="!errPw">8 caractères minimum, avec majuscule et chiffre.</span>
            </div>
            <div class="field" [class.invalid]="touched && errPw2">
              <label>Confirmer le mot de passe <span class="req">*</span></label>
              <input type="password" [(ngModel)]="pw2" name="pw2" placeholder="••••••••••" />
              <div class="field-error" *ngIf="touched && errPw2">⚠ {{ errPw2 }}</div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-block mt-2">{{ first ? 'Activer mon compte' : 'Réinitialiser' }}</button>
          </form>
          <p class="auth-foot-link"><a class="link" routerLink="/auth/login">← Retour à la connexion</a></p>
        </div>
      </main>
    </div>
  `,
})
export class ResetPasswordComponent {
  first = false;
  pw = '';
  pw2 = '';
  touched = false;
  errPw = '';
  errPw2 = '';
  colors = ['var(--error-500)', 'var(--warning-500)', 'var(--info-500)', 'var(--success-500)'];
  labels = ['Faible', 'Moyen', 'Bon', 'Robuste'];

  constructor(route: ActivatedRoute, private router: Router, private toastr: ToastrService) {
    this.first = route.snapshot.data['first'] === true;
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
    this.toastr.success(this.first ? 'Compte activé. Vous pouvez vous connecter.' : 'Mot de passe réinitialisé.', 'Portéo');
    this.router.navigate(['/auth/login']);
  }
}
