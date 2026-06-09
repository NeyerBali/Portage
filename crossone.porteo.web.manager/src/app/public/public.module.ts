import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PublicRoutingModule } from './public-routing.module';
import { LoginComponent } from './components/auth/login/login.component';
import { AuthAsideComponent } from './components/auth/auth-aside/auth-aside.component';
import { TwoFaComponent } from './components/auth/two-fa/two-fa.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';

@NgModule({
  declarations: [
    LoginComponent,
    AuthAsideComponent,
    TwoFaComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
  ],
  imports: [SharedModule, PublicRoutingModule],
})
export class PublicModule {}
