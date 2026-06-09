import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-two-fa',
  standalone: false,
  templateUrl: './two-fa.component.html',
  styleUrls: ['../login/login.component.scss'],
})
export class TwoFaComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;
  code = ['', '', '', '', '', ''];
  err = '';
  loading = false;
  sending = false;
  emailSent = false;
  countdown = 0;
  private timerId?: any;

  email = '';
  fullName = '';
  hasTotp = false;
  method: 'email' | 'totp' = 'email';
  private returnUrl = '/';

  constructor(private router: Router, private auth: AuthService, private toastr: ToastrService) {}

  ngOnInit(): void {
    const st: any = history.state || {};
    this.email = st.email;
    this.fullName = st.fullName;
    this.hasTotp = !!st.hasTotp;
    this.returnUrl = st.returnUrl || '/';
    if (!this.email) { this.router.navigate(['/auth/login']); return; }
    this.method = this.hasTotp ? 'totp' : 'email';
    if (this.method === 'email') this.sendEmail();
  }
  ngOnDestroy(): void { if (this.timerId) clearInterval(this.timerId); }

  switch(m: 'email' | 'totp'): void {
    this.method = m; this.err = ''; this.code = ['', '', '', '', '', ''];
    if (m === 'email' && !this.emailSent) this.sendEmail();
  }

  sendEmail(): void {
    this.sending = true;
    this.auth.sendVerification(this.email).subscribe({
      next: () => { this.sending = false; this.emailSent = true; this.startCountdown(); this.toastr.info(`Code envoyé à ${this.email}.`, 'Vérification'); },
      error: () => { this.sending = false; this.toastr.error("Impossible d'envoyer l'email.", 'Erreur'); },
    });
  }

  private startCountdown(): void {
    this.countdown = 45;
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => { if (this.countdown > 0) this.countdown--; }, 1000);
  }
  get countdownLabel(): string { const m = Math.floor(this.countdown / 60); const s = (this.countdown % 60).toString().padStart(2, '0'); return `${m}:${s}`; }

  set(i: number, value: string): void {
    if (!/^\d?$/.test(value)) { this.code[i] = ''; return; }
    this.code[i] = value; this.err = '';
    if (value && i < 5) this.inputs.get(i + 1)?.nativeElement.focus();
  }
  onKey(i: number, e: KeyboardEvent): void {
    if (e.key === 'Backspace' && !this.code[i] && i > 0) this.inputs.get(i - 1)?.nativeElement.focus();
  }

  verify(): void {
    const code = this.code.join('');
    if (code.length < 6) { this.err = 'Saisissez les 6 chiffres du code.'; return; }
    this.loading = true;
    const obs = this.method === 'totp' ? this.auth.verifyTotp(this.email, code) : this.auth.verifyCode(this.email, code);
    obs.subscribe({
      next: res => { this.loading = false; this.toastr.success(`Bienvenue ${res.fullName} !`, 'Connecté'); this.router.navigateByUrl(this.returnUrl); },
      error: () => { this.loading = false; this.err = 'Code invalide ou expiré.'; this.code = ['', '', '', '', '', '']; },
    });
  }
}
