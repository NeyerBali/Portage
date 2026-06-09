import { Component } from '@angular/core';

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
          <form (ngSubmit)="sent = true" novalidate>
            <div class="field">
              <label>Adresse e-mail <span class="req">*</span></label>
              <input type="email" [(ngModel)]="email" name="email" placeholder="vous@entreprise.fr" required />
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-block mt-2">Envoyer le lien</button>
          </form>
          <p class="auth-foot-link"><a class="link" routerLink="/auth/login">← Retour à la connexion</a></p>
        </div>

        <div class="auth-card fade-in" *ngIf="sent">
          <span class="auth-icon">✉</span>
          <h1>Vérifiez votre boîte mail</h1>
          <p class="sub">Un lien de réinitialisation a été envoyé à <b style="color:var(--text-default)">{{ email || 'votre adresse' }}</b>. Il expire dans 30 minutes.</p>
          <button class="btn btn-secondary btn-lg btn-block" routerLink="/auth/reset">Simuler le clic sur le lien →</button>
          <p class="auth-foot-link"><a class="link" routerLink="/auth/login">← Retour à la connexion</a></p>
        </div>
      </main>
    </div>
  `,
})
export class ForgotPasswordComponent {
  sent = false;
  email = '';
}
