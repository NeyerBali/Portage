import { Component } from '@angular/core';

/** Panneau éditorial sombre commun aux écrans d'authentification. */
@Component({
  selector: 'app-auth-aside',
  standalone: false,
  template: `
    <aside class="auth-aside">
      <div class="auth-brand"><span class="logo">P</span><span class="word">Portéo</span></div>
      <div>
        <p class="auth-overline">Portage salarial</p>
        <h1>Pilotez vos missions,<br /><em>en toute clarté.</em></h1>
        <p class="lede">Consultants, clients, missions et factures réunis dans une plateforme unique, pensée pour le portage salarial.</p>
        <div class="auth-stats">
          <div><strong>480</strong><span>Missions gérées</span></div>
          <div><strong>96 %</strong><span>Taux d'occupation</span></div>
          <div><strong>2,8 M€</strong><span>CA annuel</span></div>
        </div>
      </div>
      <p class="auth-foot">© 2026 Portéo · Crossone</p>
    </aside>
  `,
})
export class AuthAsideComponent {}
