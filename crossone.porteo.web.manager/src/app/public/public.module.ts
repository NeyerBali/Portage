import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PublicRoutingModule } from './public-routing.module';
import { LoginComponent } from './components/auth/login/login.component';

@NgModule({
  declarations: [LoginComponent],
  imports: [SharedModule, PublicRoutingModule],
})
export class PublicModule {}
