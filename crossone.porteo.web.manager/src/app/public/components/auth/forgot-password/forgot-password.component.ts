import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  template: `
    <div class="auth-shell">
      <app-auth-aside></app-auth-aside>
      <main class="auth-main">
        <div class="auth-card fade-in" *ngIf="!sent">
          <h1>Mot de passe oublié</h1>
          <p class="sub">Indiquez votre e-mail, nous vous enverrons un lien de réinitialisation.</p>
          <form (ngSubmit)="submit()" novalidate>
            <div class="field">
              <label>Adresse e-mail <span class="req">*</span></label>
              <input type="email" [(ngModel)]="email" name="email" placeholder="vous@entreprise.fr" required />
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-block mt-2" [disabled]="loading">
              <span *ngIf="!loading">Envoyer le lien</span><span *ngIf="loading" class="spin"></span>
            </button>
          </form>
          <p class="auth-foot-link"><a class="link" routerLink="/auth/login">← Retour à la connexion</a></p>
        </div>

        <div class="auth-card fade-in" *ngIf="sent">
          <span class="auth-icon">✉</span>
          <h1>Vérifiez votre boîte mail</h1>
          <p class="sub">Si un compte existe pour <b style="color:var(--text-default)">{{ email }}</b>, un lien de réinitialisation vient d'être envoyé. Il expire dans 24 heures.</p>
          <p class="auth-foot-link"><a class="link" routerLink="/auth/login">← Retour à la connexion</a></p>
        </div>
      </main>
    </div>
  `,
})
export class ForgotPasswordComponent {
  sent = false;
  loading = false;
  email = '';
  constructor(private auth: AuthService) {}
  submit(): void {
    if (!this.email) return;
    this.loading = true;
    this.auth.forgotPassword(this.email).subscribe({
      next: () => { this.loading = false; this.sent = true; },
      error: () => { this.loading = false; this.sent = true; },
    });
  }
}
