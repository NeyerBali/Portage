import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { roleGuard } from 'src/app/core/guards/role.guard';
import { LayoutComponent } from './components/dashboard-components/layout/layout.component';
import { DashboardIndexComponent } from './components/dashboard-index/dashboard-index.component';
import { MissionsListComponent } from './components/missions/missions-list/missions-list.component';
import { MissionsBoardComponent } from './components/missions/missions-board/missions-board.component';
import { MissionDetailComponent } from './components/missions/mission-detail/mission-detail.component';
import { ClientsListComponent } from './components/clients/clients-list/clients-list.component';
import { ClientDetailComponent } from './components/clients/client-detail/client-detail.component';
import { ConsultantsListComponent } from './components/consultants/consultants-list/consultants-list.component';
import { ConsultantDetailComponent } from './components/consultants/consultant-detail/consultant-detail.component';
import { FacturesListComponent } from './components/factures/factures-list/factures-list.component';
import { FactureDetailComponent } from './components/factures/facture-detail/facture-detail.component';
import { JustificatifsListComponent } from './components/justificatifs/justificatifs-list/justificatifs-list.component';
import { AlertesComponent } from './components/alertes/alertes.component';
import { JournalComponent } from './components/journal/journal.component';
import { CraListComponent } from './components/cra/cra-list.component';
import { AbsencesListComponent } from './components/absences/absences-list.component';
import { DemandesListComponent } from './components/demandes/demandes-list.component';
import { SimulateurComponent } from './components/simulateur/simulateur.component';
import { PayslipsListComponent } from './components/payslips/payslips-list.component';
import { SettingsComponent } from './components/settings/settings.component';

const admin = { canActivate: [roleGuard], data: { roles: ['Admin'] } };

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardIndexComponent },
      { path: 'missions', component: MissionsListComponent },
      { path: 'missions/tableau', component: MissionsBoardComponent },
      { path: 'missions/:id', component: MissionDetailComponent },
      { path: 'clients', component: ClientsListComponent, ...admin },
      { path: 'clients/:id', component: ClientDetailComponent, ...admin },
      { path: 'consultants', component: ConsultantsListComponent, ...admin },
      { path: 'consultants/:id', component: ConsultantDetailComponent, ...admin },
      { path: 'factures', component: FacturesListComponent },
      { path: 'factures/:id', component: FactureDetailComponent },
      { path: 'justificatifs', component: JustificatifsListComponent },
      { path: 'cra', component: CraListComponent },
      { path: 'absences', component: AbsencesListComponent },
      { path: 'demandes', component: DemandesListComponent },
      { path: 'bulletins', component: PayslipsListComponent },
      { path: 'simulateur', component: SimulateurComponent },
      { path: 'alertes', component: AlertesComponent },
      { path: 'journal', component: JournalComponent, ...admin },
      { path: 'parametres', component: SettingsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivateRoutingModule {}
