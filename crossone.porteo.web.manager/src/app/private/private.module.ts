import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '../shared/shared.module';
import { PrivateRoutingModule } from './private-routing.module';

import { MISSIONS_FEATURE_KEY, missionsReducer } from './store/missions/mission.reducer';
import { MissionEffects } from './store/missions/mission.effects';

import { LayoutComponent } from './components/dashboard-components/layout/layout.component';
import { CommandPaletteComponent } from './components/dashboard-components/command-palette/command-palette.component';
import { DashboardIndexComponent } from './components/dashboard-index/dashboard-index.component';
import { MissionsListComponent } from './components/missions/missions-list/missions-list.component';
import { MissionsBoardComponent } from './components/missions/missions-board/missions-board.component';
import { MissionDetailComponent } from './components/missions/mission-detail/mission-detail.component';
import { MissionPopupComponent } from './components/missions/mission-popup/mission-popup.component';
import { ClientsListComponent } from './components/clients/clients-list/clients-list.component';
import { ClientDetailComponent } from './components/clients/client-detail/client-detail.component';
import { ClientPopupComponent } from './components/clients/client-popup/client-popup.component';
import { ConsultantsListComponent } from './components/consultants/consultants-list/consultants-list.component';
import { ConsultantDetailComponent } from './components/consultants/consultant-detail/consultant-detail.component';
import { ConsultantPopupComponent } from './components/consultants/consultant-popup/consultant-popup.component';
import { FacturesListComponent } from './components/factures/factures-list/factures-list.component';
import { FactureDetailComponent } from './components/factures/facture-detail/facture-detail.component';
import { FacturePopupComponent } from './components/factures/facture-popup/facture-popup.component';
import { JustificatifsListComponent } from './components/justificatifs/justificatifs-list/justificatifs-list.component';
import { JustificatifPopupComponent } from './components/justificatifs/justificatif-popup/justificatif-popup.component';
import { AlertesComponent } from './components/alertes/alertes.component';
import { JournalComponent } from './components/journal/journal.component';
import { CraListComponent } from './components/cra/cra-list.component';
import { AbsencesListComponent } from './components/absences/absences-list.component';
import { DemandesListComponent } from './components/demandes/demandes-list.component';
import { SimulateurComponent } from './components/simulateur/simulateur.component';
import { PayslipsListComponent } from './components/payslips/payslips-list.component';
import { SettingsComponent } from './components/settings/settings.component';

@NgModule({
  declarations: [
    LayoutComponent,
    CommandPaletteComponent,
    DashboardIndexComponent,
    MissionsListComponent,
    MissionsBoardComponent,
    MissionDetailComponent,
    MissionPopupComponent,
    ClientsListComponent,
    ClientDetailComponent,
    ClientPopupComponent,
    ConsultantsListComponent,
    ConsultantDetailComponent,
    ConsultantPopupComponent,
    FacturesListComponent,
    FactureDetailComponent,
    FacturePopupComponent,
    JustificatifsListComponent,
    JustificatifPopupComponent,
    AlertesComponent,
    JournalComponent,
    CraListComponent,
    AbsencesListComponent,
    DemandesListComponent,
    SimulateurComponent,
    PayslipsListComponent,
    SettingsComponent,
  ],
  imports: [
    SharedModule,
    DragDropModule,
    PrivateRoutingModule,
    StoreModule.forFeature(MISSIONS_FEATURE_KEY, missionsReducer),
    EffectsModule.forFeature([MissionEffects]),
  ],
})
export class PrivateModule {}
