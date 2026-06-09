import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  showPassword = false;
  loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    remember: [true],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
  ) {}

  get f() { return this.form.controls; }

  fill(role: 'admin' | 'consultant'): void {
    this.form.patchValue({
      email: role === 'admin' ? 'neyerbali6@gmail.com' : 'neyerbali6+consultant@gmail.com',
      password: 'Porteo2026!',
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Veuillez corriger le formulaire.', 'Formulaire incomplet');
      return;
    }
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: challenge => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        // Étape 2 : double authentification (email ou application).
        this.router.navigate(['/auth/2fa'], {
          state: { email: challenge.email, fullName: challenge.fullName, hasTotp: challenge.hasTotp, returnUrl },
        });
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Email ou mot de passe incorrect.', 'Échec de connexion');
      },
    });
  }
}
