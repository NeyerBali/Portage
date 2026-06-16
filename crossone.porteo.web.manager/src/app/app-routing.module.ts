import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { VitrineComponent } from './public/components/vitrine/vitrine.component';

const routes: Routes = [
  // Page d'accueil publique (site vitrine) — première page au lancement.
  { path: '', pathMatch: 'full', component: VitrineComponent },
  {
    path: 'auth',
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./private/private.module').then(m => m.PrivateModule),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
